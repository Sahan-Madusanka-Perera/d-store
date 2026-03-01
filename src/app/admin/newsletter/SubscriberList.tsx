import { Badge } from '@/components/ui/badge';
import { Mail, Calendar } from 'lucide-react';

export default function SubscriberList({ subscribers }: { subscribers: any[] }) {
    if (subscribers.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No subscribers yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-1">When users sign up for your newsletter, they will appear here.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100 text-sm font-medium text-gray-500">
                        <th className="pb-3 pl-4">Email Address</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 pr-4 text-right">Subscribed Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {subscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 pl-4 font-medium text-gray-900">
                                {sub.email}
                            </td>
                            <td className="py-4">
                                <Badge
                                    variant="outline"
                                    className={`
                                        ${sub.status === 'subscribed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}
                                    `}
                                >
                                    {sub.status === 'subscribed' ? 'Active' : 'Unsubscribed'}
                                </Badge>
                            </td>
                            <td className="py-4 pr-4 text-right text-sm text-gray-500">
                                <span className="flex items-center justify-end gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(sub.created_at).toLocaleDateString()}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
