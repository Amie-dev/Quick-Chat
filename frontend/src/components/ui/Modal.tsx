import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: "sm" | "md" | "lg"
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
}) => {
    if (!isOpen) return null;

    const sizeClass = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
    };

    return <>
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div
                 className={`
                    bg-white rounded-2xl shadow-lg w-full ${sizeClass[size]} p-6    
                `}
            >
                {/* Headeer */}
                <div className="flex justify-between items-center mb-4">
                    {title && <h2 className="text-xl text-black font-semibold">{title}</h2>}
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-lg font-bold cursor-pointer"
                    >
                       {/*  */}
                        <X />
                    </button>
                </div>

                {/* Body */}
                <div className="mb-4">
                    {children}
                </div>

                {/* Footer */}
                {footer && <div className="mt-4">{footer}</div>}
            </div>
        </div>
    </>
}

export default Modal;