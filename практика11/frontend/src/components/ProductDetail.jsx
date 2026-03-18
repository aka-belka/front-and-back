import React from 'react';

export default function ProductDetailModal({ open, product, onClose, onEdit, onDelete }) {
    if (!open || !product) return null;

    const handleDelete = () => {
        if (window.confirm('Удалить товар?')) {
            onDelete(product.id);
            onClose();
        }
    };

    const handleEdit = () => {
        onEdit(product);
        onClose();
    };

    return (
        <div className="backdrop" onClick={onClose}>
            <div className="modal modal--detail" style={{background: "rgb(2, 33, 33)"}}onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <div className="modal__title " style={{color:"white"}}>Детали товара</div>
                    <button className="iconBtn" style={{color:"white"}} onClick={onClose}>✕</button>
                </div>

                <div className="modal__content">
                    <div className="detail-row">
                        <span className="detail-label">ID:</span>
                        <span className="detail-value" style={{color:"white"}}>#{product.id}</span>
                    </div>
                    
                    <div className="detail-row">
                        <span className="detail-label">Название:</span>
                        <span className="detail-value" style={{color:"white"}}>{product.name}</span>
                    </div>
                    
                    <div className="detail-row">
                        <span className="detail-label">Категория:</span>
                        <span className="detail-value" style={{color:"white"}}>{product.category}</span>
                    </div>
                    
                    <div className="detail-row">
                        <span className="detail-label">Описание:</span>
                        <span className="detail-value detail-value--description" style={{color:"white"}}>
                            {product.description}
                        </span>
                    </div>
                    
                    <div className="detail-row">
                        <span className="detail-label" style={{color:"white"}}> Цена:</span>
                        <span className="detail-value detail-value--price">
                            {product.price} ₽
                        </span>
                    </div>
                </div>

                <div className="modal__footer modal__footer--between">
                    <button className="btn btn--edit" onClick={handleEdit}>
                        Редактировать
                    </button>
                    <button className="btn btn--danger" onClick={handleDelete}>
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );
}