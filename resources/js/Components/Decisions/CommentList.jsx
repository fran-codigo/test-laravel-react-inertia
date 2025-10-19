import { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function CommentList({ decisionId, reloadComments }) {
    const [comments, setComments] = useState([]);
    const [totalComments, setTotalComments] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComments();
    }, [decisionId, reloadComments]);

    const fetchComments = async () => {
        try {
            const response = await fetch(
                `/api/decisions/${decisionId}/comments`
            );
            const data = await response.json();
            setComments(data.data);
            setTotalComments(data.total);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (string) => {
        return string ? string.substring(0, 2).toUpperCase() : "";
    };

    const getRelativeTime = (timestamp) => {
        const now = new Date();
        const date = new Date(timestamp);
        const seconds = Math.floor((now - date) / 1000);

        const intervals = {
            año: 31536000,
            mes: 2592000,
            semana: 604800,
            día: 86400,
            hora: 3600,
            minuto: 60,
            segundo: 1,
        };

        for (const [name, secondsInInterval] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInInterval);

            if (interval >= 1) {
                if (interval === 1) {
                    return `hace 1 ${name}`;
                }
                // Pluralizar
                const plural = name === "mes" ? "meses" : `${name}s`;
                return `hace ${interval} ${plural}`;
            }
        }

        return "justo ahora";
    };

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (comments.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="font-semibold text-blue-900 mb-1">
                    No hay comentarios aún
                </p>
            </div>
        );
    }

    return (
        <div className="mt-5 bg-white border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-1">
                Comentarios ({totalComments})
            </h3>
            <div className="space-y-3">
                {comments.map((comment) => (
                    <div
                        key={comment.id}
                        className="bg-gray-50 rounded-lg p-3 flex gap-2"
                    >
                        <p className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center">
                            {getInitials(comment.user?.name)}
                        </p>

                        <div className="flex-1">
                            <p className="text-xs text-gray-500 mt-1">
                                {comment.user?.name}{" "}
                                {getRelativeTime(comment.created_at)}
                            </p>
                            <p className="text-sm text-gray-600 ml-3 line-clamp-3">
                                {comment.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
