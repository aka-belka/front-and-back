import React from 'react';

export default function UserItem({ user, onEdit, onDelete, currentUserId }) {
    const isCurrentUser = user.id === currentUserId;

    return (
        <div className="userRow">
            <div className="userMain">
                <div className="userEmail">{user.email}</div>
                <div className="userName">{user.first_name} {user.last_name}</div>
                <div className={`userRole userRole--${user.role}`}>{user.role}</div>
            </div>

            <div className="userActions">
                <button 
                    className="btn btn--edit" 
                    onClick={() => onEdit(user)}
                >
                    Редактировать
                </button>
                {!isCurrentUser && (
                    <button 
                        className="btn btn--danger" 
                        onClick={() => onDelete(user.id)}
                        disabled={isCurrentUser}
                    >
                        Заблокировать
                    </button>
                )}
            </div>
        </div>
    );
}