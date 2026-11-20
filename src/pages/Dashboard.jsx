
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [projectKey, setProjectKey] = useState('');

    const [selectedProject, setSelectedProject] = useState(null);
    const [memberEmail, setMemberEmail] = useState('');
    const [memberRole, setMemberRole] = useState('developer');
    const [memberMessage, setMemberMessage] = useState('');

    const fetchProjects = async () => {
        try {
            const response = await API.get('/projects');
            setProjects(response.data.projects || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load projects.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await API.post('/projects', {
                name,
                description,
                key: projectKey.toUpperCase(),
            });

            setName('');
            setDescription('');
            setProjectKey('');
            setShowForm(false);
            setLoading(true);

            await fetchProjects();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create project.');
        }
    };

    // ADD PROJECT MEMBER
    const handleAddMember = async (e) => {
        e.preventDefault();
        setMemberMessage('');
        setError('');

        try {
            const response = await API.post(
                `/projects/${selectedProject._id}/members`,
                {
                    email: memberEmail,
                    role: memberRole
                }
            );

            setMemberMessage(response.data.message);
            setMemberEmail('');
            setMemberRole('developer');

            await fetchProjects();

        } catch (err) {
            setMemberMessage(
                err.response?.data?.message || 'Failed to add member.'
            );
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>Bug Tracker</h1>
                    <p>Manage your projects and issues</p>
                </div>

                <div className="user-info">
                    <span>Welcome, {user?.name || 'User'}</span>
                    <button onClick={logout}>Logout</button>
                </div>
            </header>

            <main className="dashboard-content">
                <div className="section-heading">
                    <div>
                        <h2>My Projects</h2>
                        <p>Manage all your projects in one place.</p>
                    </div>

                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Create Project'}
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                {/* MANAGE PROJECT MEMBERS */}
                {selectedProject && (
                    <div className="project-form">
                        <h3>Manage Members: {selectedProject.name}</h3>

                        <h4>Current Members</h4>

                        {selectedProject.members?.map((member) => (
                            <p key={member._id}>
                                {member.name} ({member.email})
                            </p>
                        ))}

                        <form onSubmit={handleAddMember}>
                            <label>Member Email</label>

                            <input
                                type="email"
                                placeholder="Enter registered user email"
                                value={memberEmail}
                                onChange={(e) => setMemberEmail(e.target.value)}
                                required
                            />

                            <label>Member Role</label>

                            <select
                                value={memberRole}
                                onChange={(e) => setMemberRole(e.target.value)}
                            >
                                <option value="manager">Manager</option>
                                <option value="developer">Developer</option>
                                <option value="viewer">Viewer</option>
                            </select>

                            <button type="submit">Add Member</button>
                        </form>

                        {memberMessage && <p>{memberMessage}</p>}

                        <button
                            type="button"
                            onClick={() => {
                                setSelectedProject(null);
                                setMemberEmail('');
                                setMemberRole('developer');
                                setMemberMessage('');
                            }}
                        >
                            Close
                        </button>
                    </div>
                )}

                {/* CREATE PROJECT */}
                {showForm && (
                    <form className="project-form" onSubmit={handleCreateProject}>
                        <h3>Create New Project</h3>

                        <label>Project Name</label>
                        <input
                            type="text"
                            placeholder="Enter project name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <label>Project Key</label>
                        <input
                            type="text"
                            placeholder="Example: BUG"
                            value={projectKey}
                            onChange={(e) => setProjectKey(e.target.value)}
                            maxLength={10}
                            required
                        />

                        <label>Description</label>
                        <textarea
                            placeholder="Enter project description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <button type="submit">Create Project</button>
                    </form>
                )}

                {/* PROJECT LIST */}
                {loading ? (
                    <p>Loading projects...</p>
                ) : projects.length === 0 ? (
                    <div className="empty-state">
                        <h3>No Projects Yet</h3>
                        <p>Create your first project to get started.</p>
                    </div>
                ) : (
                    <div className="projects-grid">
                        {projects.map((project) => (
                            <div key={project._id}>
                                <Link
                                    to={`/projects/${project._id}`}
                                    className="project-card"
                                >
                                    <span className="project-key">{project.key}</span>
                                    <h3>{project.name}</h3>
                                    <p>
                                        {project.description || 'No description available.'}
                                    </p>
                                    <span className="project-status">
                                        {project.status}
                                    </span>
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedProject(project);
                                        setMemberMessage('');
                                    }}
                                >
                                    Manage Members
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
