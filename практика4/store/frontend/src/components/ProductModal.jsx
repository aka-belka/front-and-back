import React, { useEffect, useState } from "react";

export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit}) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [photoFile, setPhotoFile] = useState(null);
    const [photoUrl, setPhotoUrl] = useState("");

    useEffect(() => {
        if (!open) return;
        setName(initialProduct?.name ?? "");
        setCategory(initialProduct?.category ?? "");
        setDescription(initialProduct?.description ?? "");
        setPrice(initialProduct?.price != null ? String(initialProduct.price) : "");
        setQuantity(initialProduct?.quantity != null ? String(initialProduct.quantity) : "");
        if (initialProduct?.photo) {
            setPhotoUrl(`http://localhost:3000${initialProduct.photo}`);
        } else {
            setPhotoUrl("");
        }
        setPhotoFile(null);
    }, [open, initialProduct]);

    if (!open) return null;

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoUrl(URL.createObjectURL(file));
        }
    };

    const title = mode === "edit" ? "Редактирование товара" : "Создание товара";
    
    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedName = name.trim();
        const trimmedCategory = category.trim();
        const trimmedDescription = description.trim();
        const parsedPrice = Number(price); 
        const parsedQuantity = Number(quantity);

        if (!trimmedName) {
            alert("Введите имя");
            return;
        }
        if (!trimmedCategory) {
            alert("Введите категорию");
            return;
        }
        if (!trimmedDescription) {
            alert("Введите описание");
            return;
        }
        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            alert("Введите корректную цену");
            return;
        }
        if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
            alert("Введите корректное колличество");
            return;
        }

        if (mode === "create" && !photoFile) {
            alert("Добавьте фото товара");
            return;
        }

        const formData = new FormData();
        formData.append('name', trimmedName);
        formData.append('category', trimmedCategory);
        formData.append('description', trimmedDescription);
        formData.append('price', parsedPrice);
        formData.append('quantity', parsedQuantity);
        
        if (photoFile) {
            formData.append('photo', photoFile);
        }
        
        if (initialProduct?.id) {
            formData.append('id', initialProduct.id);
        }
        
        onSubmit(formData)
    };

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}role="dialog" aria-modal="true">
                <div className="modal__header">
                    <div className="modal__title">{title}</div>
                    <button className="iconBtn" onClick={onClose} aria-label="Закрыть">
                        ✕
                    </button>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <label className="label">
                        Название  
                        <input
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Например, подушка"
                            autoFocus
                        />
                    </label>

                    <label className="label">
                        Категория  
                        <input
                            className="input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Например, текстиль"
                            autoFocus
                        />
                    </label>
                    <div className="photo-section">
                        <label className="label">
                            {"Фотография товара"} {mode === "create" }
                            <div className="photo-preview" style={{display:"flex", flexDirection: 'column', alignItems: 'center', justifyContent: "center"}}>
                                {photoUrl && (
                                        <img 
                                            src={photoUrl} 
                                            alt={name || "Фото товара"} 
                                            className="modal-photo"
                                            style={{width:200, height: 200}}
                                        />
                                    
                                )}
                                <button 
                                    className="btn btn--cancel"
                                    onClick={() => document.getElementById('photo-upload').click()}
                                    style={{marginTop: '10px', width:130}}
                                >
                                    {mode === "edit" ? "Изменить фото" : "Загрузить фото"}
                                </button>
                            </div>
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                required={mode === "create"}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>

                    <label className="label">
                        Описание  
                        <input
                            className="input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Например, материал пух, цвет белый"
                            autoFocus
                        />
                    </label>

                    <label className="label">
                        Цена  
                        <input
                            className="input"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Например, 500"
                            inputMode="numeric"
                        />
                    </label>

                    <label className="label">
                        Количество  
                        <input
                            className="input"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="Например, 10"
                            inputMode="numeric"
                        />
                    </label>

                    <div className="modal__footer">
                        <button type="button" className="btn btn--cancel" onClick={onClose}>
                            Отмена  
                        </button>
                        <button type="submit" className="btn btn--primary">
                            {mode === "edit" ? "Сохранить" : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}