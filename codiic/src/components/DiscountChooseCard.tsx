import { useCallback } from "react";

type PropTypes = {
    title: string;
    desc: string;
    route: string;
    onClick: (route: string) => void;
}

export default function DiscountChooseCard({ title, desc, route, onClick }: PropTypes) {
    const handleClick = useCallback(() => {
        onClick(route);
    }, [route, onClick]);

    return (
        <div className="bg-admin-surface rounded-xl border border-admin-border p-6 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <h4 className="text-base font-semibold text-admin-text">{title}</h4>
                    <p className="text-sm text-admin-text-secondary">{desc}</p>
                </div>
                <button
                    onClick={handleClick}
                    className="w-full bg-admin-text text-white px-4 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors text-sm font-medium"
                >
                    Apply Discount
                </button>
            </div>
        </div>
    );
}
