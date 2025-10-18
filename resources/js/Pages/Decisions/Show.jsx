import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import VoteOption from '@/Components/Decisions/VoteOption';
import { ClockIcon, UserIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Show({ id }) {
    const { auth } = usePage().props;
    const [decision, setDecision] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState(null);
    const [comment, setComment] = useState('');
    const [voting, setVoting] = useState(false);

    useEffect(() => {
        fetchDecision();
    }, [id]);

    const fetchDecision = async () => {
        try {
            const response = await fetch(`/api/decisions/${id}`);
            const data = await response.json();
            setDecision(data);
            if (data.user_vote) {
                setSelectedOption(data.user_vote.option_id);
            }
        } catch (error) {
            console.error('Error fetching decision:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async () => {
        if (!selectedOption) return;

        setVoting(true);
        try {
            const response = await fetch('/api/votes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    decision_id: id,
                    option_id: selectedOption,
                    comment: comment || null
                })
            });

            if (response.ok) {
                await fetchDecision();
                setComment('');
            } else {
                const error = await response.json();
                alert(error.message);
            }
        } catch (error) {
            console.error('Error voting:', error);
        } finally {
            setVoting(false);
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

    if (!decision) {
        return (
            <AuthenticatedLayout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Decisión no encontrada</p>
                </div>
            </AuthenticatedLayout>
        );
    }

    const getStatusBadge = () => {
        switch (decision.status) {
            case 'open':
                return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">Abierta</span>;
            case 'decided':
                return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">Decidida</span>;
            case 'expired':
                return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full">Expirada</span>;
            default:
                return null;
        }
    };

    const canVote = decision.status === 'open' &&
                   !decision.is_expired &&
                   !decision.user_has_voted &&
                   decision.user_id !== auth.user.id;

    return (
        <AuthenticatedLayout>
            <Head title={decision.title} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {decision.title}
                                    </h1>
                                    {getStatusBadge()}
                                </div>

                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center">
                                        <UserIcon className="w-4 h-4 mr-1" />
                                        {decision.is_anonymous ? 'Anónimo' : decision.user?.name}
                                    </span>
                                    <span className="flex items-center">
                                        <ClockIcon className="w-4 h-4 mr-1" />
                                        Expira en: {decision.time_remaining}
                                    </span>
                                    <span>
                                        {decision.total_votes} votos totales
                                    </span>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <h3 className="font-semibold text-gray-700 mb-2">Contexto</h3>
                                    <p className="text-gray-600 whitespace-pre-wrap">{decision.context}</p>
                                </div>

                                {decision.status === 'decided' && decision.final_option && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                        <h3 className="font-semibold text-blue-900 mb-1">Decisión Final</h3>
                                        <p className="text-blue-700">
                                            El usuario eligió: <strong>{decision.final_option.text}</strong>
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <h3 className="font-semibold text-gray-700">Opciones</h3>
                                    {decision.options.map((option) => (
                                        <VoteOption
                                            key={option.id}
                                            option={option}
                                            selected={selectedOption === option.id}
                                            onSelect={() => canVote && setSelectedOption(option.id)}
                                            canVote={canVote}
                                            totalVotes={decision.total_votes}
                                            hasVoted={decision.user_has_voted}
                                            userVoteId={decision.user_vote?.option_id}
                                        />
                                    ))}
                                </div>

                                {canVote && (
                                    <div className="mt-6 space-y-4">
                                        <div>
                                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                                                Comentario (opcional)
                                            </label>
                                            <textarea
                                                id="comment"
                                                rows="2"
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="¿Por qué elegiste esta opción?"
                                            />
                                        </div>
                                        <button
                                            onClick={handleVote}
                                            disabled={!selectedOption || voting}
                                            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {voting ? 'Votando...' : 'Votar'}
                                        </button>
                                    </div>
                                )}

                                {decision.user_has_voted && (
                                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                                        <span className="text-green-700">Ya has votado en esta decisión</span>
                                    </div>
                                )}

                                {decision.user_id === auth.user.id && (
                                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-yellow-700">Esta es tu decisión. No puedes votar.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {decision.votes && decision.votes.length > 0 && (
                        <div className="mt-6 bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="font-semibold text-gray-700 mb-4">Comentarios de los votantes</h3>
                                <div className="space-y-3">
                                    {decision.votes
                                        .filter(vote => vote.comment)
                                        .map((vote) => (
                                            <div key={vote.id} className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-sm text-gray-600">{vote.comment}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    - {vote.user?.name || 'Usuario'}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}