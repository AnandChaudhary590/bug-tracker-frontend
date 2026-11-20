
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import API from '../services/api';

const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
];


const DraggableTicket = ({ ticket, onEdit, onDelete, onComments }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: ticket._id,
        });

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="ticket-card"
        >
            <span className="ticket-type">{ticket.type}</span>
            <h4>{ticket.title}</h4>
            <p>{ticket.description || 'No description'}</p>

            <div className="ticket-footer">
                <span>Priority: {ticket.priority}</span>
                <span>{ticket.assignee?.name || 'Unassigned'}</span>
            </div>

            <div className="ticket-actions">
                <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(ticket);
                    }}
                >
                    Edit
                </button>

                <button
                    const type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(ticket._id);
                    }}
                >
                    Delete
                </button>
                <button
    type="button"
    onPointerDown={(e) => e.stopPropagation()}
    onClick={(e) => {
        e.stopPropagation();
        onComments(ticket);
    }}
>
    Comments
</button>
            </div>
        </div>
    );
};


const BoardColumn = ({ column, tickets, onEdit, onDelete, onComments }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    });

    return (
        <div
            ref={setNodeRef}
            className={`board-column ${isOver ? 'column-over' : ''}`}
        >
            <div className="column-heading">
                <h3>{column.title}</h3>
                <span>{tickets.length}</span>
            </div>

            <div className="ticket-list">
                {tickets.map((ticket) => (
                    <DraggableTicket
    key={ticket._id}
    ticket={ticket}
    onEdit={onEdit}
    onDelete={onDelete}
    onComments={onComments}
/>
                ))}

                {tickets.length === 0 && (
                    <p className="empty-column">No tickets yet</p>
                )}
            </div>
        </div>
    );
};

const KanbanBoard = () => {
    const { projectId } = useParams();

    const [board, setBoard] = useState({
        todo: [],
        inProgress: [],
        done: [],
    });

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [type, setType] = useState('bug');
    const [assignee, setAssignee] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
const [priorityFilter, setPriorityFilter] = useState('all');
const [typeFilter, setTypeFilter] = useState('all');
const [editingTicket, setEditingTicket] = useState(null);
const [selectedTicket, setSelectedTicket] = useState(null);
const [commentText, setCommentText] = useState('');
const [comments, setComments] = useState([]);
const [commentLoading, setCommentLoading] = useState(false);
const [editTitle, setEditTitle] = useState('');
const [editDescription, setEditDescription] = useState('');
const [editPriority, setEditPriority] = useState('medium');
const [editType, setEditType] = useState('bug');

    const fetchBoard = async () => {
        try {
            const [boardResponse, projectResponse] = await Promise.all([
                API.get(`/tickets/board/${projectId}`),
                API.get(`/projects/${projectId}`),
            ]);

            setBoard(
                boardResponse.data.board || {
                    todo: [],
                    inProgress: [],
                    done: [],
                }
            );

            setProject(projectResponse.data.project);
            setError('');
        } catch (err) {
            setError(
                err.response?.data?.message || 'Failed to load Kanban board.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoard();
    }, [projectId]);


    const filterTickets = (tickets) => {
    return tickets.filter((ticket) => {
        const matchesSearch =
            ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ticket.description || '')
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesPriority =
            priorityFilter === 'all' ||
            ticket.priority === priorityFilter;

        const matchesType =
            typeFilter === 'all' ||
            ticket.type === typeFilter;

        return matchesSearch && matchesPriority && matchesType;
    });
};


const fetchComments = async (ticketId) => {
    try {
        const response = await API.get(
            `/tickets/${ticketId}/comments`
        );
        setComments(response.data.comments || []);
    } catch (err) {
        setError(
            err.response?.data?.message || 'Failed to load comments.'
        );
    }
};

const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim() || !selectedTicket) return;

    setCommentLoading(true);

    try {
        await API.post(
            `/tickets/${selectedTicket._id}/comments`,
            { text: commentText }
        );

        setCommentText('');
        await fetchComments(selectedTicket._id);
    } catch (err) {
        setError(
            err.response?.data?.message || 'Failed to add comment.'
        );
    } finally {
        setCommentLoading(false);
    }
};


const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setEditTitle(ticket.title);
    setEditDescription(ticket.description || '');
    setEditPriority(ticket.priority);
    setEditType(ticket.type);
};

const handleUpdateTicket = async (e) => {
    e.preventDefault();
    setError('');

    try {
        await API.put(`/tickets/${editingTicket._id}`, {
            title: editTitle,
            description: editDescription,
            priority: editPriority,
            type: editType,
        });

        setEditingTicket(null);
        await fetchBoard();
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to update ticket.');
    }
};

const handleDeleteTicket = async (ticketId) => {
    const confirmDelete = window.confirm(
        'Are you sure you want to delete this ticket?'
    );

    if (!confirmDelete) return;

    try {
        await API.delete(`/tickets/${ticketId}`);
        await fetchBoard();
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete ticket.');
    }
};
    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) return;

        const ticketId = active.id;
        const newStatus = over.id;

        const allTickets = [
            ...board.todo,
            ...board.inProgress,
            ...board.done,
        ];

        const ticket = allTickets.find((item) => item._id === ticketId);

        if (!ticket || ticket.status === newStatus) return;

        const previousBoard = board;

        const updatedTicket = {
            ...ticket,
            status: newStatus,
        };

        const updatedTickets = allTickets.map((item) =>
            item._id === ticketId ? updatedTicket : item
        );

        setBoard({
            todo: updatedTickets.filter((item) => item.status === 'todo'),
            inProgress: updatedTickets.filter(
                (item) => item.status === 'in-progress'
            ),
            done: updatedTickets.filter((item) => item.status === 'done'),
        });

        try {
            await API.patch(`/tickets/${ticketId}/status`, {
                status: newStatus,
            });
        } catch (err) {
            setBoard(previousBoard);
            setError(
                err.response?.data?.message || 'Unable to update ticket status.'
            );
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await API.post('/tickets', {
    title,
    description,
    projectId,
    priority,
    type,
    assignee: assignee || null,
});

            setTitle('');
            setDescription('');
            setPriority('medium');
            setType('bug');
            setShowForm(false);
            setAssignee('');

            setLoading(true);
            await fetchBoard();
        } catch (err) {
            setError(
                err.response?.data?.message || 'Failed to create ticket.'
            );
        }
    };

    if (loading) {
        return <div className="page-loading">Loading Kanban Board...</div>;
    }

    return (
        <div className="kanban-container">
            <header className="kanban-header">
                <div>
                    <Link to="/dashboard">← Back to Dashboard</Link>
                    <h1>{project?.name || 'Kanban Board'}</h1>
                    <p>Manage your project tickets</p>
                </div>

                <button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Create Ticket'}
                </button>
            </header>

            {error && <div className="error-message">{error}</div>}

            {showForm && (
                <form className="ticket-form" onSubmit={handleCreateTicket}>
                    <h2>Create New Ticket</h2>

                    <label>Ticket Title</label>
                    <input
                        type="text"
                        placeholder="Enter ticket title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />

                    <label>Description</label>
                    <textarea
                        placeholder="Describe the issue or task"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <label>Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="bug">Bug</option>
                        <option value="task">Task</option>
                        <option value="story">Story</option>
                    </select>
                    
                                        <label>Assign Member</label>
                    <select
                        value={assignee}
                        onChange={(e) => setAssignee(e.target.value)}
                    >
                        <option value="">Unassigned</option>
                        {project?.members?.map((member) => (
                            <option key={member._id} value={member._id}>
                                {member.name} ({member.email})
                            </option>
                        ))}
                    </select>
                    <label>Priority</label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>

                    <button type="submit">Create Ticket</button>
                </form>
            )}
            
            
{editingTicket && (
    <form className="ticket-form" onSubmit={handleUpdateTicket}>
        <h2>Edit Ticket</h2>

        <label>Ticket Title</label>
        <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
        />

        <label>Description</label>
        <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
        />

        <label>Type</label>
        <select
            value={editType}
            onChange={(e) => setEditType(e.target.value)}
        >
            <option value="bug">Bug</option>
            <option value="task">Task</option>
            <option value="story">Story</option>
        </select>

        <label>Priority</label>
        <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value)}
        >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
        </select>

        <button type="submit">Update Ticket</button>
        <button
            type="button"
            onClick={() => setEditingTicket(null)}
        >
            Cancel
        </button>
    </form>
)}



{selectedTicket && (
    <div className="comments-panel">
        <div className="comments-header">
            <h2>Comments: {selectedTicket.title}</h2>
            <button
                type="button"
                onClick={() => {
                    setSelectedTicket(null);
                    setComments([]);
                    setCommentText('');
                }}
            >
                Close
            </button>
        </div>

        <div className="comments-list">
            {comments.length === 0 ? (
                <p>No comments yet. Be the first to comment!</p>
            ) : (
                comments.map((comment) => (
                    <div key={comment._id} className="comment-item">
                        <strong>
                            {comment.user?.name || 'User'}
                        </strong>
                        <p>{comment.text}</p>
                        <small>
                            {new Date(comment.createdAt).toLocaleString()}
                        </small>
                    </div>
                ))
            )}
        </div>

        <form onSubmit={handleAddComment}>
            <textarea
                placeholder="Write your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
            />

            <button type="submit" disabled={commentLoading}>
                {commentLoading ? 'Sending...' : 'Add Comment'}
            </button>
        </form>
    </div>
)}

            {/* Search and Filter */}
            <div className="ticket-filters">
                <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>

                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="all">All Types</option>
                    <option value="bug">Bug</option>
                    <option value="task">Task</option>
                    <option value="story">Story</option>
                </select>
            </div>

            <DndContext onDragEnd={handleDragEnd}>
                <div className="kanban-board">
                    {columns.map((column) => {
                       
                        const tickets = filterTickets(
                            column.id === 'todo'
                                ? board.todo
                                : column.id === 'in-progress'
                                    ? board.inProgress
                                    : board.done
                        );


                        return (
                            <BoardColumn
    key={column.id}
    column={column}
    tickets={tickets}
    onEdit={handleEditTicket}
    onDelete={handleDeleteTicket}
    onComments={(ticket) => {
    setSelectedTicket(ticket);
    fetchComments(ticket._id);
}}
/>
                        );
                    })}
                </div>
            </DndContext>
        </div>
    );
};

export default KanbanBoard;
