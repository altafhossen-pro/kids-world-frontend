'use client'

import { useState, useEffect } from 'react'
import { Eye, Mail, Phone, Calendar, Search } from 'lucide-react'
import { contactAPI } from '@/services/api'
import { useAppContext } from '@/context/AppContext'
import Pagination from '@/components/Common/Pagination'
import toast from 'react-hot-toast'

export default function ContactMessagesPage() {
    const { token } = useAppContext()
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [statusFilter, setStatusFilter] = useState('')
    const [selectedMessage, setSelectedMessage] = useState(null)
    const limit = 20

    useEffect(() => {
        if (token) {
            fetchMessages()
        }
    }, [token, currentPage, statusFilter])

    const fetchMessages = async () => {
        try {
            setLoading(true)
            const params = { page: currentPage, limit }
            if (statusFilter) {
                params.status = statusFilter
            }
            
            const res = await contactAPI.getAllContacts(params, token)
            if (res.success) {
                setMessages(res.data.contacts)
                setTotalPages(res.data.pagination.pages)
                setTotalItems(res.data.pagination.total)
            } else {
                toast.error(res.message || 'Failed to fetch messages')
            }
        } catch (error) {
            console.error('Error fetching messages:', error)
            toast.error('Error fetching messages')
        } finally {
            setLoading(false)
        }
    }

    const openMessageDetails = async (message) => {
        setSelectedMessage(message)
        // If it's new/unread, fetching it by ID will mark it as read
        if (!message.isRead) {
            try {
                await contactAPI.getContactById(message._id, token)
                // update local state
                setMessages(prev => prev.map(m => m._id === message._id ? { ...m, isRead: true } : m))
            } catch (error) {
                console.error("Error marking message as read", error)
            }
        }
    }

    const closeMessageDetails = () => {
        setSelectedMessage(null)
    }

    const updateMessageStatus = async (id, newStatus) => {
        try {
            const res = await contactAPI.updateContactStatus(id, { status: newStatus }, token)
            if (res.success) {
                toast.success('Status updated successfully')
                setMessages(prev => prev.map(m => m._id === id ? { ...m, status: newStatus } : m))
                if (selectedMessage && selectedMessage._id === id) {
                    setSelectedMessage({ ...selectedMessage, status: newStatus })
                }
            } else {
                toast.error(res.message || 'Failed to update status')
            }
        } catch (error) {
            toast.error('Error updating status')
        }
    }

    const getStatusBadge = (status, isRead) => {
        if (!isRead) {
            return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">New</span>
        }
        switch (status) {
            case 'replied':
                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Replied</span>
            case 'new':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Unread</span>
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            View and manage messages sent from the Contact Us page
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">All Messages</option>
                        <option value="new">New</option>
                        <option value="replied">Replied</option>
                    </select>
                </div>
            </div>

            {/* Messages Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </td>
                                </tr>
                            ) : messages.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No messages found.
                                    </td>
                                </tr>
                            ) : (
                                messages.map((message) => (
                                    <tr key={message._id} className={`hover:bg-gray-50 ${!message.isRead ? 'bg-blue-50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(message.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{message.name}</div>
                                            <div className="text-sm text-gray-500">{message.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="font-medium">{message.subject}</div>
                                            <div className="text-gray-500 text-xs truncate max-w-xs">{message.message}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(message.status, message.isRead)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openMessageDetails(message)}
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={totalItems}
                        itemsPerPage={limit}
                    />
                </div>
            )}

            {/* Message Details Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-[3px] transition-opacity" aria-hidden="true" onClick={closeMessageDetails}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        {/* Modal panel */}
                        <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full z-10 border border-gray-100">
                            <div className="bg-white px-6 pt-6 pb-6 sm:p-8">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                                            <h3 className="text-2xl font-bold text-gray-900" id="modal-title">
                                                Message Details
                                            </h3>
                                            {getStatusBadge(selectedMessage.status, selectedMessage.isRead)}
                                        </div>
                                        <div className="mt-4 space-y-4 bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                                <span className="font-medium">From:</span> {selectedMessage.name} ({selectedMessage.email})
                                            </div>
                                            {selectedMessage.phone && (
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Phone className="h-5 w-5 text-gray-400" />
                                                    <span className="font-medium">Phone:</span> {selectedMessage.phone}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Calendar className="h-5 w-5 text-gray-400" />
                                                <span className="font-medium">Date:</span> {new Date(selectedMessage.createdAt).toLocaleString()}
                                            </div>
                                            
                                            <div className="mt-8">
                                                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                                                    Subject: {selectedMessage.subject}
                                                </h4>
                                                <div className="bg-gray-50 p-5 rounded-xl text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-200/60 shadow-inner">
                                                    {selectedMessage.message}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50/80 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-100 justify-between items-center">
                                <div>
                                    <button
                                        type="button"
                                        onClick={closeMessageDetails}
                                        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Close
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    {selectedMessage.status !== 'replied' && (
                                        <button
                                            type="button"
                                            onClick={() => updateMessageStatus(selectedMessage._id, 'replied')}
                                            className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-sm font-semibold text-white hover:from-green-600 hover:to-green-700 focus:outline-none sm:w-auto transition-all transform hover:scale-[1.02]"
                                        >
                                            Mark as Replied
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
