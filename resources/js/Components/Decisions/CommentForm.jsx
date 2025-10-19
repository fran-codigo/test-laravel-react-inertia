import { useForm } from "@inertiajs/react";
import { useState } from "react";
import PrimaryButton from "../PrimaryButton";

export default function CommentForm({ decisionId, onCommentAdded }) {
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const { data, setData, processing, reset } = useForm({
        content: "",
    });

    const maxChars = 1000;
    const charCount = data.content.length;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `/api/decisions/${decisionId}/comments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-CSRF-TOKEN": document.querySelector(
                            'meta[name="csrf-token"]'
                        ).content,
                    },
                    body: JSON.stringify(data),
                }
            );

            if (response.ok) {
                const result = await response.json();
                onCommentAdded();
                setErrorMessage("");
                reset();

                setSuccessMessage("Comentario publicado con éxito.");

                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            } else {
                const errorData = await response.json();

                if (errorData.errors && errorData.errors.content) {
                    setErrorMessage(errorData.errors.content[0]);
                } else if (errorData.message) {
                    setErrorMessage(errorData.message);
                } else {
                    setErrorMessage(
                        "Ocurrió un error al enviar el comentario."
                    );
                }
            }
        } catch (error) {
            console.log("Error creating comment:", error);
            // setErrorMessage(error.response.data.message);
        }
    };

    return (
        <div className="mt-5 bg-white border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-1">
                Agregar comentario
            </h3>
            <div className="space-y-3">
                <form onSubmit={handleSubmit}>
                    <textarea
                        maxLength={maxChars}
                        value={data.content}
                        onChange={(e) => setData("content", e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    ></textarea>
                    <div
                        className={`text-sm text-right ${
                            charCount >= maxChars
                                ? "text-red-500"
                                : "text-gray-500"
                        }`}
                    >
                        {charCount}/{maxChars}
                    </div>

                    {successMessage && (
                        <div className="text-green-600 text-sm mt-1">
                            {successMessage}
                        </div>
                    )}

                    {errorMessage && (
                        <div className="text-red-600 text-sm mt-1">
                            {errorMessage}
                        </div>
                    )}
                    <PrimaryButton
                        className="mt-2"
                        disabled={processing}
                        type="submit"
                    >
                        Publicar comentario
                    </PrimaryButton>
                </form>
            </div>
        </div>
    );
}
