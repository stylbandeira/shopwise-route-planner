// components/NotificationToast.tsx
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function NotificationToast({
    message,
    duration = 5000
}: {
    message: string;
    duration?: number;
}) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    if (!visible) return null;

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-xs flex items-start gap-3">
                <CheckCircle className="text-green-500 flex-shrink-0" />
                <div>
                    <p className="text-sm font-medium text-green-800">{message}</p>
                </div>
            </div>
        </div>
    );
}