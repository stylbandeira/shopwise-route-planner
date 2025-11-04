// components/forms/MultiSelectSearch.tsx
import { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Option {
    id: number;
    name: string;
}

interface MultiSelectSearchProps {
    label: string;
    value: number[]; // array de IDs
    onChange: (ids: number[]) => void;
    options: Option[];
    isLoading?: boolean;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
}

export function MultiSelectSearch({
    label,
    value,
    onChange,
    options,
    isLoading = false,
    error,
    placeholder = "Buscar e selecionar...",
    disabled = false
}: MultiSelectSearchProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filtrar opções baseado na busca
    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5); // Limitar a 5 resultados

    // Opções selecionadas (para mostrar os badges)
    const selectedOptions = options.filter(option =>
        value.includes(option.id)
    );

    const handleSelect = (optionId: number) => {
        if (!value.includes(optionId)) {
            onChange([...value, optionId]);
        }
        setSearchTerm("");
        setIsOpen(false);
    };

    const handleRemove = (optionId: number) => {
        onChange(value.filter(id => id !== optionId));
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    const handleInputBlur = (e: React.FocusEvent) => {
        // Delay para permitir clicar nas opções
        setTimeout(() => setIsOpen(false), 200);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchTerm && filteredOptions.length > 0) {
            e.preventDefault();
            handleSelect(filteredOptions[0].id);
        }
        if (e.key === 'Backspace' && !searchTerm && value.length > 0) {
            handleRemove(value[value.length - 1]);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
                {label}
            </label>

            <div className="relative">
                {/* Input de busca */}
                <div className="flex items-center gap-2 border rounded-md p-2 min-h-10 bg-background">
                    {/* Badges das opções selecionadas */}
                    <div className="flex flex-wrap gap-1 flex-1">
                        {selectedOptions.map(option => (
                            <Badge key={option.id} variant="secondary" className="flex items-center gap-1">
                                {option.name}
                                <X
                                    className="w-3 h-3 cursor-pointer"
                                    onClick={() => handleRemove(option.id)}
                                />
                            </Badge>
                        ))}

                        {/* Input de busca */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            onKeyDown={handleKeyDown}
                            placeholder={selectedOptions.length === 0 ? placeholder : ""}
                            disabled={disabled}
                            className="flex-1 outline-none bg-transparent min-w-20"
                        />
                    </div>

                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* Dropdown de opções */}
                {isOpen && !disabled && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                        {isLoading ? (
                            <div className="p-2 text-sm text-muted-foreground">Carregando...</div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">
                                {searchTerm ? "Nenhum resultado encontrado" : "Digite para buscar"}
                            </div>
                        ) : (
                            filteredOptions.map(option => (
                                <div
                                    key={option.id}
                                    className={`p-2 cursor-pointer hover:bg-accent ${value.includes(option.id) ? 'bg-accent' : ''
                                        }`}
                                    onClick={() => handleSelect(option.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{option.name}</span>
                                        {value.includes(option.id) && (
                                            <Badge variant="outline" className="text-xs">Selecionado</Badge>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    );
}