import React, { useState, useEffect } from 'react';
import { api } from '../api';
import ProductModal from './ProductModal';
import ProductDetailModal from './ProductDetail';

export default function ProductsPage({ onLogout }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [viewingProduct, setViewingProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await api.getProducts();
            console.log('Товары с сервера:', JSON.stringify(data, null, 2))
            setProducts(data);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setModalMode('create');
        setSelectedProduct(null);
        setModalOpen(true);
    };

    const handleEdit = (product) => {
        setModalMode('edit');
        setSelectedProduct(product);
        setModalOpen(true);
    };

    const handleViewDetails = (product) => {
        setViewingProduct(product);
        setDetailModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
            setDetailModalOpen(false);
        } catch (error) {
            alert('Ошибка при удалении');
        }
    };

    const handleSubmit = async (formData) => {
        try {
            const productData = {
                name: formData.get('name'),
                category: formData.get('category'),
                description: formData.get('description'),
                price: Number(formData.get('price')),
                imageUrl: formData.get('imageUrl')
            };

            if (modalMode === 'create') {
                const newProduct = await api.createProduct(productData);
                setProducts([...products, newProduct]);
            } else {
                const updatedProduct = await api.updateProduct(selectedProduct.id, productData);
                setProducts(products.map(p => 
                    p.id === updatedProduct.id ? updatedProduct : p
                ));
            }
            setModalOpen(false);
        } catch (error) {
            alert('Ошибка при сохранении');
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="products-page">
            <div className="page-header">
                <h1>Товары</h1>
                <div>
                    <button className="btn btn--primary" onClick={handleCreate}>
                        Добавить товар
                    </button>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="empty">Товаров пока нет</div>
            ) : (
                <div className="list">
                    {products.map((product) => (
                        <div 
                            key={product.id} 
                            className="productRow"
                            onClick={() => handleViewDetails(product)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="productMain">
                                <div>
                                    <div className="productName">{product.name}</div>
                                    <div className="productCategory">{product.category}</div>
                                    <div className="productDescription">{product.description}</div>
                                    <div className="productPrice">{product.price} ₽</div>
                                </div>

                                {product.imageUrl && (
                                    <div className="product-thumbnail">
                                        <img 
                                            src={product.imageUrl} 
                                            alt={product.name}
                                            onError={(e) => e.target.style.display = 'none'}
                                            style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain' }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="productActions" onClick={(e) => e.stopPropagation()}>
                                <button 
                                    className="btn btn--edit" 
                                    onClick={() => handleEdit(product)}
                                >
                                    Редактировать
                                </button>
                                <button 
                                    className="btn btn--danger" 
                                    onClick={() => {
                                        if (window.confirm('Удалить товар?')) {
                                            handleDelete(product.id);
                                        }
                                    }}
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ProductModal
                open={modalOpen}
                mode={modalMode}
                initialProduct={selectedProduct}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
            />

            <ProductDetailModal
                open={detailModalOpen}
                product={viewingProduct}
                onClose={() => setDetailModalOpen(false)}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}