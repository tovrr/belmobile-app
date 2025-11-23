
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Reservation, Quote, Product, Service, Shop, FranchiseApplication, BlogPost } from '../types';
import { MOCK_RESERVATIONS, MOCK_QUOTES, MOCK_PRODUCTS, MOCK_SERVICES, MOCK_SHOPS, MOCK_FRANCHISE_APPLICATIONS, MOCK_BLOG_POSTS } from '../constants';
import { db } from '../firebase';
import { useNotification } from './NotificationContext';
import { 
    collection, 
    onSnapshot, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    orderBy,
    getDocs,
    writeBatch,
    setDoc
} from 'firebase/firestore';

type ReservationStatus = 'pending' | 'approved' | 'cancelled';
type QuoteStatus = 'new' | 'processing' | 'responded' | 'closed';
type FranchiseApplicationStatus = 'new' | 'reviewing' | 'approved' | 'rejected';

interface DataContextType {
    reservations: Reservation[];
    quotes: Quote[];
    products: Product[];
    services: Service[];
    shops: Shop[];
    franchiseApplications: FranchiseApplication[];
    blogPosts: BlogPost[];
    loading: boolean;
    addReservation: (reservation: Omit<Reservation, 'id' | 'date' | 'status'>) => void;
    addQuote: (quote: Omit<Quote, 'id' | 'date' | 'status'>) => void;
    addFranchiseApplication: (application: Omit<FranchiseApplication, 'id' | 'date' | 'status'>) => void;
    updateReservationStatus: (id: number, status: ReservationStatus) => void;
    updateQuoteStatus: (id: number, status: QuoteStatus) => void;
    updateFranchiseApplicationStatus: (id: number, status: FranchiseApplicationStatus) => void;
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: number) => void;
    updateShop: (shop: Shop) => void; 
    addBlogPost: (post: Omit<BlogPost, 'id' | 'date'>) => void;
    updateBlogPost: (post: BlogPost) => void;
    deleteBlogPost: (id: number) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { addNotification } = useNotification();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [franchiseApplications, setFranchiseApplications] = useState<FranchiseApplication[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    // --- 1. INITIAL DATA SEEDING (Runs once on mount if DB is empty) ---
    useEffect(() => {
        const seedDatabase = async () => {
            try {
                const productsSnap = await getDocs(collection(db, 'products'));
                if (productsSnap.empty) {
                    console.log('Database empty. Seeding initial data...');
                    const batch = writeBatch(db);

                    MOCK_PRODUCTS.forEach(p => {
                        const docRef = doc(db, 'products', String(p.id));
                        batch.set(docRef, p);
                    });

                    MOCK_SHOPS.forEach(s => {
                        const docRef = doc(db, 'shops', String(s.id));
                        batch.set(docRef, s);
                    });

                    MOCK_SERVICES.forEach(s => {
                        const docRef = doc(db, 'services', String(s.id));
                        batch.set(docRef, s);
                    });
                    
                    MOCK_BLOG_POSTS.forEach(b => {
                        const docRef = doc(db, 'blogPosts', String(b.id));
                        batch.set(docRef, b);
                    });

                    MOCK_RESERVATIONS.forEach(r => {
                        const docRef = doc(db, 'reservations', String(r.id));
                        batch.set(docRef, r);
                    });

                    MOCK_QUOTES.forEach(q => {
                        const docRef = doc(db, 'quotes', String(q.id));
                        batch.set(docRef, q);
                    });

                    await batch.commit();
                    console.log('Database seeded successfully!');
                }
            } catch (error) {
                console.error("Error seeding database:", error);
                addNotification('error', 'Failed to seed initial database.');
            }
        };

        seedDatabase();
    }, []);

    // --- 2. REAL-TIME LISTENERS ---
    
    const subscribe = (collectionName: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
        const q = query(collection(db, collectionName));
        return onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: Number(doc.id) || doc.id
            }));
            setter(items);
        }, (error) => {
            console.error(`Error in snapshot listener for ${collectionName}:`, error);
            // Only notify if it's a permission error, as network errors are handled by Firebase internally often
            if (error.code === 'permission-denied') {
                addNotification('error', `Permission denied for ${collectionName}`);
            }
        });
    };

    useEffect(() => {
        const unsubProducts = subscribe('products', setProducts);
        const unsubServices = subscribe('services', setServices);
        const unsubShops = subscribe('shops', setShops);
        const unsubReservations = subscribe('reservations', setReservations);
        const unsubQuotes = subscribe('quotes', setQuotes);
        const unsubFranchise = subscribe('franchiseApplications', setFranchiseApplications);
        const unsubBlog = subscribe('blogPosts', setBlogPosts);

        setLoading(false);

        return () => {
            unsubProducts();
            unsubServices();
            unsubShops();
            unsubReservations();
            unsubQuotes();
            unsubFranchise();
            unsubBlog();
        };
    }, []);


    // --- 3. CRUD OPERATIONS ---

    const addReservation = async (newReservationData: Omit<Reservation, 'id' | 'date' | 'status'>) => {
        try {
            const id = Date.now();
            const newReservation: Reservation = {
                ...newReservationData,
                id,
                date: new Date().toISOString().split('T')[0],
                status: 'pending',
            };
            await setDoc(doc(db, 'reservations', String(id)), newReservation);
            addNotification('success', 'Reservation submitted successfully!');
        } catch (error) {
            console.error(error);
            addNotification('error', 'Failed to submit reservation.');
        }
    };
    
    const addQuote = async (newQuoteData: Omit<Quote, 'id' | 'date' | 'status'>) => {
        try {
            const id = Date.now();
            const newQuote: Quote = {
                ...newQuoteData,
                id,
                date: new Date().toISOString().split('T')[0],
                status: 'new',
            };
            await setDoc(doc(db, 'quotes', String(id)), newQuote);
            addNotification('success', 'Quote request sent successfully!');
        } catch (error) {
            console.error(error);
            addNotification('error', 'Failed to send quote request.');
        }
    };

    const addFranchiseApplication = async (applicationData: Omit<FranchiseApplication, 'id' | 'date' | 'status'>) => {
        try {
            const id = Date.now();
            const newApplication: FranchiseApplication = {
                ...applicationData,
                id,
                date: new Date().toISOString().split('T')[0],
                status: 'new',
            };
            await setDoc(doc(db, 'franchiseApplications', String(id)), newApplication);
            addNotification('success', 'Application submitted successfully!');
        } catch (error) {
            console.error(error);
            addNotification('error', 'Failed to submit application.');
        }
    };

    const updateReservationStatus = async (id: number, status: ReservationStatus) => {
        try {
            const docRef = doc(db, 'reservations', String(id));
            await updateDoc(docRef, { status });
            addNotification('success', 'Reservation status updated.');
        } catch (error) {
            console.error(error);
            addNotification('error', 'Failed to update status.');
        }
    };

    const updateQuoteStatus = async (id: number, status: QuoteStatus) => {
        try {
            const docRef = doc(db, 'quotes', String(id));
            await updateDoc(docRef, { status });
            addNotification('success', 'Quote status updated.');
        } catch (error) {
            console.error(error);
            addNotification('error', 'Failed to update status.');
        }
    };

    const updateFranchiseApplicationStatus = async (id: number, status: FranchiseApplicationStatus) => {
        try {
            const docRef = doc(db, 'franchiseApplications', String(id));
            await updateDoc(docRef, { status });
            addNotification('success', 'Application status updated.');
        } catch (error) {
            console.error(error);
            addNotification('error', 'Failed to update status.');
        }
    };

    const addProduct = async (productData: Omit<Product, 'id'>) => {
        try {
            const id = Date.now();
            const newProduct: Product = {
                ...productData,
                id,
            };
            await setDoc(doc(db, 'products', String(id)), newProduct);
            addNotification('success', 'Product added successfully.');
        } catch (error) {
            console.error(error);
            addNotification('error', 'Failed to add product.');
        }
    };

    const updateProduct = async (updatedProduct: Product) => {
        try {
            const docRef = doc(db, 'products', String(updatedProduct.id));
            await updateDoc(docRef, { ...updatedProduct });
            addNotification('success', 'Product updated successfully.');
        } catch (error) {
            console.error(error);
            addNotification('error', 'Failed to update product.');
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            await deleteDoc(doc(db, 'products', String(id)));
            addNotification('success', 'Product deleted.');
        } catch (error) {
            console.error(error);
            addNotification('error', 'Failed to delete product.');
        }
    };

    const updateShop = async (updatedShop: Shop) => {
        try {
            const docRef = doc(db, 'shops', String(updatedShop.id));
            await updateDoc(docRef, { ...updatedShop });
            addNotification('success', 'Shop details updated.');
        } catch (error) {
            console.error(error);
            addNotification('error', 'Failed to update shop.');
        }
    };

    const addBlogPost = async (postData: Omit<BlogPost, 'id' | 'date'>) => {
        try {
            const id = Date.now();
            const newPost: BlogPost = {
                ...postData,
                id,
                date: new Date().toISOString().split('T')[0]
            };
            await setDoc(doc(db, 'blogPosts', String(id)), newPost);
            addNotification('success', 'Article published.');
        } catch (error) {
            console.error(error);
            addNotification('error', 'Failed to publish article.');
        }
    };

    const updateBlogPost = async (updatedPost: BlogPost) => {
        try {
            const docRef = doc(db, 'blogPosts', String(updatedPost.id));
            await updateDoc(docRef, { ...updatedPost });
            addNotification('success', 'Article updated.');
        } catch (error) {
            console.error(error);
            addNotification('error', 'Failed to update article.');
        }
    };

    const deleteBlogPost = async (id: number) => {
        try {
            await deleteDoc(doc(db, 'blogPosts', String(id)));
            addNotification('success', 'Article deleted.');
        } catch (error) {
            console.error(error);
            addNotification('error', 'Failed to delete article.');
        }
    };

    const value = {
        reservations,
        quotes,
        products,
        services,
        shops,
        franchiseApplications,
        blogPosts,
        loading,
        addReservation,
        addQuote,
        addFranchiseApplication,
        updateReservationStatus,
        updateQuoteStatus,
        updateFranchiseApplicationStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        updateShop,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
