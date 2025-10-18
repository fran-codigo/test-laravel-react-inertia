import { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function CommentList({ decisionId }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComments();
    }, [decisionId]);

    const fetchComments = async () => {
        try {
            const response = await fetch(
                `/api/decisions/${decisionId}/comments`
            );
            const data = await response.json();
            setComments(data.data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
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
                <p className="text-gray-500">Sin comentarios</p>
            </div>
        );
    }

    return (
        <div>
            <h2>Comments for Decision {decisionId}</h2>
        </div>
    );
}
