import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Camera, AlertCircle, QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import jsQR from 'jsqr';
import api from "@/lib/api";

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (data: any) => void;
    onError?: (error: string) => void;
}

export function QRCodeModal({ isOpen, onClose, onSuccess, onError }: QRCodeModalProps) {
    const [mode, setMode] = useState<'choice' | 'upload' | 'camera'>('choice');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [qrDetected, setQrDetected] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>();
    const processingRef = useRef(false);

    // Limpar recursos quando o modal fechar
    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            setMode('choice');
            setError(null);
            setQrDetected(false);
            setScanning(false);

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = undefined;
            }
        }
    }, [isOpen]);

    // Inicializar câmera quando o modo for alterado
    useEffect(() => {
        if (mode === 'camera' && isOpen) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [mode, isOpen]);

    const startCamera = async () => {

        if (permissionStatus === 'denied') {
            showPermissionDeniedError();
            setMode('choice');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Tentar obter acesso à câmera
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setCameraStream(stream);
            setPermissionStatus('granted');

            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                // Esperar o vídeo estar pronto
                await new Promise<void>((resolve) => {
                    if (videoRef.current) {
                        const onLoaded = () => {
                            videoRef.current?.play().then(() => {
                                resolve();
                            }).catch(err => {
                                console.error("Erro no play:", err);
                                resolve();
                            });
                        };

                        if (videoRef.current.readyState >= 3) {
                            onLoaded();
                        } else {
                            videoRef.current.onloadedmetadata = onLoaded;
                        }
                    }
                });
                setScanning(true);

                setTimeout(() => {
                    const scan = () => {
                        if (!videoRef.current || !canvasRef.current || qrDetected) {
                            return;
                        }
                        scanQRCode();

                        if (!qrDetected) {
                            animationFrameRef.current = requestAnimationFrame(scan);
                        }
                    };

                    animationFrameRef.current = requestAnimationFrame(scan);
                }, 100);

                const scanFrame = () => {
                    if (!videoRef.current || !canvasRef.current || !isOpen || mode !== 'camera' || qrDetected || !scanning) {
                        return;
                    }

                    scanQRCode();

                    if (scanning && !qrDetected) {
                        animationFrameRef.current = requestAnimationFrame(scanFrame);
                    }
                };

                animationFrameRef.current = requestAnimationFrame(scanFrame);
            }
        } catch (err: any) {
            console.error('Erro ao acessar câmera:', err);
            handleCameraError(err);
        } finally {
            setLoading(false);
        }
    };

    const startScanLoop = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        const scan = () => {
            if (!videoRef.current || !canvasRef.current || !isOpen || mode !== 'camera' || qrDetected || !scanning) {
                return;
            }

            scanQRCode();

            // Continuar o loop
            if (scanning && !qrDetected) {
                animationFrameRef.current = requestAnimationFrame(scan);
            }
        };

        // Iniciar o loop
        animationFrameRef.current = requestAnimationFrame(scan);
    };

    const scanQRCode = () => {

        // Verificar referências diretamente
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) {
            return;
        }

        // Verificar se o vídeo tem dados
        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
            return;
        }

        // Verificar dimensões
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            return;
        }

        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) {
            return;
        }

        // Ajustar canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Desenhar frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
            // Extrair dados
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

            // Detectar QR Code
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

            if (qrCode && qrCode.data && !processingRef.current) {
                processQRCode(qrCode.data);
                return; // Para imediatamente após detectar
            }
        } catch (err) {
            console.error('Erro no processamento:', err);
        }
    };

    const processQRCode = async (qrData: string) => {
        if (processingRef.current) {
            return;
        }

        processingRef.current = true;
        setQrDetected(true);
        setScanning(false);
        stopCamera();

        setLoading(true);
        setError(null);

        try {
            await sendQRCodeToBackend(qrData);
            setTimeout(() => {
                onClose();
            }, 500);
        } catch (err) {
            setQrDetected(false);
            setScanning(false);
            setError('Erro ao processar QR Code. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleCameraError = (err: any) => {
        let errorMessage = 'Não foi possível acessar a câmera.';

        switch (err.name) {
            case 'NotAllowedError':
            case 'PermissionDeniedError':
                errorMessage = 'Permissão para usar a câmera foi negada.';
                setPermissionStatus('denied');
                break;
            case 'NotFoundError':
                errorMessage = 'Nenhuma câmera encontrada.';
                break;
            case 'NotReadableError':
                errorMessage = 'A câmera está sendo usada por outro aplicativo.';
                break;
            case 'SecurityError':
                errorMessage = 'Acesso à câmera bloqueado por questões de segurança.';
                break;
            default:
                errorMessage = `Erro ao acessar a câmera: ${err.message || 'Erro desconhecido'}`;
        }

        setError(errorMessage);
        setMode('choice');
    };

    const showPermissionDeniedError = () => {
        setError(
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Permissão negada</span>
                </div>
                <p className="text-sm">
                    O acesso à câmera foi bloqueado. Para usar o scanner:
                </p>
                <ul className="text-sm list-disc pl-4 space-y-1">
                    <li>Clique no ícone de cadeado na barra de endereço</li>
                    <li>Procure por "Permissões da câmera"</li>
                    <li>Altere para "Permitir"</li>
                    <li>Recarregue a página</li>
                </ul>
            </div>
        );
    };

    const stopCamera = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = undefined;
        }

        if (cameraStream) {
            cameraStream.getTracks().forEach(track => {
                track.stop();
            });
            setCameraStream(null);
        }

        setScanning(false);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setError('Tipo de arquivo inválido. Use apenas JPG, JPEG ou PNG.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Criar uma imagem para ler o arquivo
            const img = new Image();
            const reader = new FileReader();

            const qrData = await new Promise<string>((resolve, reject) => {
                reader.onload = (e) => {
                    img.src = e.target?.result as string;

                    img.onload = () => {
                        // Criar canvas temporário
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d', { willReadFrequently: true });

                        if (!ctx) {
                            reject(new Error('Erro ao criar contexto 2D'));
                            return;
                        }

                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        // Ler QR Code usando jsQR
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

                        if (qrCode && qrCode.data) {
                            resolve(qrCode.data);
                        } else {
                            reject(new Error('Nenhum QR Code encontrado na imagem.'));
                        }
                    };

                    img.onerror = () => {
                        reject(new Error('Erro ao carregar a imagem.'));
                    };
                };

                reader.onerror = () => {
                    reject(new Error('Erro ao ler o arquivo.'));
                };

                reader.readAsDataURL(file);
            });

            // Enviar QR Code para o backend
            await sendQRCodeToBackend(qrData);
            onClose();

        } catch (err: any) {
            console.error('Erro ao processar imagem:', err);
            setError(err.message || 'Não foi possível ler o QR Code da imagem.');
        } finally {
            setLoading(false);
            // Limpar o input file
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const sendQRCodeToBackend = async (qrData: string) => {
        try {

            // Extrair apenas os parâmetros da URL se for uma URL completa
            let dataToSend = qrData;

            // Se for uma URL, tentar extrair os parâmetros
            if (qrData.includes('?')) {
                try {
                    const url = new URL(qrData);
                    const params = new URLSearchParams(url.search);

                    if (params.has('p')) {
                        dataToSend = params.get('p') || qrData;
                    }
                } catch (err) {
                    console.warn('Não foi possível analisar como URL:', err);
                }
            }

            const response = await api.post('/products/qrcode', {
                qr_code_data: dataToSend
            });

            if (onSuccess) {
                onSuccess(response.data);
            }

            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erro ao processar QR Code';
            console.error('Erro ao enviar QR Code:', err);
            setError(errorMessage);

            if (onError) {
                onError(errorMessage);
            }

            throw err;
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleBackToChoice = () => {
        stopCamera();
        setMode('choice');
        setError(null);
        setQrDetected(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
                stopCamera();
            }
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Escanear QR Code</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                stopCamera();
                                onClose();
                            }}
                            className="h-8 w-8 p-0"
                            disabled={loading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {mode === 'choice' && (
                        <div className="grid grid-cols-1 gap-3">
                            <Button
                                onClick={() => setMode('upload')}
                                className="h-14 justify-start gap-3 text-base"
                                variant="outline"
                                disabled={loading}
                            >
                                <Upload className="h-5 w-5" />
                                <div className="text-left">
                                    <div className="font-semibold">Enviar arquivo</div>
                                    <div className="text-xs text-muted-foreground">JPG, PNG, JPEG</div>
                                </div>
                            </Button>

                            <Button
                                onClick={() => {
                                    if (permissionStatus === 'denied') {
                                        showPermissionDeniedError();
                                    } else {
                                        setMode('camera');
                                    }
                                }}
                                className="h-14 justify-start gap-3 text-base"
                                variant="outline"
                                disabled={loading || permissionStatus === 'denied'}
                            >
                                <Camera className="h-5 w-5" />
                                <div className="text-left">
                                    <div className="font-semibold">Abrir câmera</div>
                                    <div className="text-xs text-muted-foreground">
                                        {permissionStatus === 'denied'
                                            ? 'Permissão negada - clique para instruções'
                                            : 'Escanear QR Code automaticamente'}
                                    </div>
                                </div>
                            </Button>
                        </div>
                    )}

                    {mode === 'upload' && (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="mb-2">Clique para selecionar uma imagem</p>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Formatos suportados: JPG, PNG, JPEG
                                </p>
                                <Button
                                    onClick={triggerFileInput}
                                    disabled={loading}
                                    className="min-w-[150px]"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Processando...
                                        </div>
                                    ) : 'Selecionar Arquivo'}
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    disabled={loading}
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleBackToChoice}
                                disabled={loading}
                            >
                                Voltar
                            </Button>
                        </div>
                    )}

                    {mode === 'camera' && (
                        <div className="space-y-4">
                            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-cover"
                                    playsInline
                                    muted
                                    autoPlay
                                />
                                <canvas ref={canvasRef} className="hidden" />

                                {/* Overlay para ajudar na centralização */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-48 h-48 border-2 border-white/50 rounded-lg relative">
                                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white"></div>
                                    </div>
                                </div>

                                {loading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                        <div className="text-white text-center p-4">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></div>
                                            <p className="font-medium">Processando QR Code...</p>
                                        </div>
                                    </div>
                                )}

                                {!loading && cameraStream && (
                                    <div className="absolute bottom-4 left-0 right-0 text-center">
                                        <div className="inline-flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                            <QrCode className="h-3 w-3" />
                                            <span>Escaneando QR Code...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <Button
                                    variant="outline"
                                    onClick={handleBackToChoice}
                                    disabled={loading}
                                >
                                    Voltar
                                </Button>

                                <div className="text-sm text-muted-foreground text-center">
                                    {!cameraStream && loading && 'Iniciando câmera...'}
                                    {cameraStream && !qrDetected && 'Aponte para um QR Code'}
                                    {cameraStream && qrDetected && 'Processando...'}
                                </div>

                                {cameraStream && !loading && (
                                    <Button
                                        variant="outline"
                                        onClick={stopCamera}
                                        disabled={loading}
                                    >
                                        Parar Câmera
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-medium">Atenção</p>
                                <div className="text-sm mt-1">{error}</div>
                                {permissionStatus === 'denied' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => {
                                            setError(null);
                                            setMode('upload');
                                        }}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Usar upload de arquivo
                                    </Button>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setError(null)}
                                className="h-8 w-8 p-0 flex-shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}