'use client';

import { useState, useEffect, Fragment, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button, Input } from '@mantine/core';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Import Quill CSS locally
import 'quill/dist/quill.snow.css';

const MySwal = withReactContent(Swal);

// Dynamically import Quill (no SSR)
const QuillEditor = dynamic(() => import('quill'), { ssr: false });

export default function AddPage() {
    const [open, setOpen] = useState(false);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [pageName, setPageName] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [showCsvUpload, setShowCsvUpload] = useState(false);
    const [csvFile, setCsvFile] = useState(null);

    // Refs for Quill editors and instances
    const editorRef = useRef(null);
    const viewEditorRef = useRef(null);
    const quillInstanceRef = useRef(null);
    const viewQuillInstanceRef = useRef(null);
    const isViewEditorInitialized = useRef(false); // Track if the view editor is initialized

    useEffect(() => {
        fetchPages();
    }, []);

    // Initialize Quill for the "Add Page" modal
    useEffect(() => {
        let Quill;
        if (typeof window !== 'undefined' && editorRef.current && open) {
            import('quill').then((module) => {
                Quill = module.default || module;
                if (!quillInstanceRef.current) {
                    quillInstanceRef.current = new Quill(editorRef.current, {
                        theme: 'snow',
                        modules: {
                            toolbar: [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                ['blockquote', 'code-block'],
                                [{ 'align': [] }],
                                ['link', 'image'],
                                ['clean'],
                            ],
                        },
                        placeholder: 'Type something here...',
                    });

                    // Set initial content
                    quillInstanceRef.current.root.innerHTML = content;

                    // Update content state on text change
                    quillInstanceRef.current.on('text-change', () => {
                        setContent(quillInstanceRef.current.root.innerHTML);
                    });
                }
            });
        }

        // Cleanup on unmount or when modal closes
        return () => {
            if (quillInstanceRef.current) {
                quillInstanceRef.current.off('text-change');
                quillInstanceRef.current = null;
            }
        };
    }, [open]);

    // Initialize Quill for the "View/Edit Page" modal
    useEffect(() => {
        let Quill;
        if (typeof window !== 'undefined' && viewEditorRef.current && openViewModal && selectedPage && !isViewEditorInitialized.current) {
            import('quill').then((module) => {
                Quill = module.default || module;
                if (!viewQuillInstanceRef.current) {
                    viewQuillInstanceRef.current = new Quill(viewEditorRef.current, {
                        theme: 'snow',
                        modules: {
                            toolbar: [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                ['blockquote', 'code-block'],
                                [{ 'align': [] }],
                                ['link', 'image'],
                                ['clean'],
                            ],
                        },
                        placeholder: 'Type something here...',
                    });

                    // Set initial content
                    viewQuillInstanceRef.current.root.innerHTML = selectedPage.content;

                    // Update selectedPage content on text change
                    viewQuillInstanceRef.current.on('text-change', () => {
                        const newContent = viewQuillInstanceRef.current.root.innerHTML;
                        setSelectedPage((prev) => ({
                            ...prev,
                            content: newContent,
                        }));
                    });

                    // Mark the editor as initialized
                    isViewEditorInitialized.current = true;
                }
            });
        }

        // Cleanup on unmount or when modal closes
        return () => {
            if (viewQuillInstanceRef.current) {
                viewQuillInstanceRef.current.off('text-change');
                viewQuillInstanceRef.current = null;
                isViewEditorInitialized.current = false; // Reset initialization flag
            }
        };
    }, [openViewModal]); // Removed selectedPage from dependencies

    const fetchPages = async () => {
        try {
            const response = await fetch('/api/page');
            if (!response.ok) throw new Error('Failed to fetch pages');
            const data = await response.json();
            setPages(data.pages);
        } catch (error) {
            console.error('Error fetching pages:', error);
        }
    };

    const handleCsvUpload = () => {
        if (!csvFile) return;

        const formData = new FormData();
        formData.append("file", csvFile);

        fetch("/api/uploadcsv", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.importedCount > 0) {
                    MySwal.fire({
                        title: `Total ${data.pages.length} pages uploaded successfully!`,
                        toast: true,
                        position: "bottom-start",
                        showConfirmButton: false,
                        timer: 5000,
                        showCloseButton: true,
                    });
                    fetchPages();
                    setShowCsvUpload(false);
                } else {
                    MySwal.fire({
                        title: "Failed to upload CSV data",
                        text: data.message || "An error occurred",
                        icon: "error",
                        showConfirmButton: true,
                    });
                }
            })
            .catch((error) => {
                MySwal.fire({
                    title: "Upload Error",
                    text: "Something went wrong. Please try again.",
                    icon: "error",
                    showConfirmButton: true,
                });
            });
    };

    const stripHtml = (html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent || "";
    };

    const downloadCsv = () => {
        if (pages.length === 0) {
            MySwal.fire({
                title: "No pages available to download",
                icon: "warning",
                toast: true,
                position: "bottom-start",
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
            return;
        }

        const csvHeader = "Page Name,Title,Content\n";
        const csvRows = pages.map(page =>
            `"${page.pageName.replace(/"/g, '""')}","${page.title.replace(/"/g, '""')}","${stripHtml(page.content).replace(/"/g, '""')}"`
        );

        const csvContent = csvHeader + csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "pages.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSave = async () => {
        try {
            const response = await fetch('/api/page', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageName, title, content }),
            });

            if (!response.ok) throw new Error('Failed to save page');

            fetchPages();
            setPageName('');
            setTitle('');
            setContent('');
            setOpen(false);
            setMessage('Page added successfully');

            MySwal.fire({
                title: "Page uploaded successfully",
                toast: true,
                position: "bottom-start",
                showConfirmButton: false,
                timer: 5000,
                showCloseButton: true,
            });
        } catch (error) {
            console.error('Error saving page:', error);
        }
    };

    const handleCancel = () => {
        setSelectedPage(null);
        setIsEditing(false);
        setOpenViewModal(false);
    };

    const handleCsvFileChange = (e) => {
        setCsvFile(e.target.files[0]);
    };

    const handleUpdate = async () => {
        if (!selectedPage) return;

        try {
            const response = await fetch(`/api/page/${selectedPage._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pageName: selectedPage.pageName,
                    title: selectedPage.title,
                    content: selectedPage.content,
                }),
            });

            if (!response.ok) throw new Error('Failed to update page');

            const data = await response.json();
            setPages(pages.map((page) => (page._id === selectedPage._id ? data.page : page)));
            setIsEditing(false);
            setOpenViewModal(false);
            setMessage('Page updated successfully');

            MySwal.fire({
                title: "Page updated successfully",
                toast: true,
                position: "bottom-start",
                showConfirmButton: false,
                timer: 5000,
                showCloseButton: true,
            });
        } catch (error) {
            console.error('Error updating page:', error);
        }
    };

    const handleDelete = async () => {
        if (!selectedPage) return;

        try {
            const response = await fetch(`/api/page/${selectedPage._id}`, { method: 'DELETE' });

            if (!response.ok) throw new Error('Failed to delete page');

            setPages(pages.filter((page) => page._id !== selectedPage._id));
            setOpenViewModal(false);
            setSelectedPage(null);
            setMessage('Page deleted successfully');

            MySwal.fire({
                title: "Page deleted successfully",
                toast: true,
                position: "bottom-start",
                showConfirmButton: false,
                timer: 5000,
                showCloseButton: true,
            });
        } catch (error) {
            console.error('Error deleting page:', error);
        }
    };

    const groupedPages = pages.reduce((acc, page) => {
        if (!acc[page.pageName]) acc[page.pageName] = [];
        acc[page.pageName].push(page);
        return acc;
    }, {});

    return (
        <div className="p-4">
            <Button onClick={() => setOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Add Page</Button>
            <Button onClick={() => setShowCsvUpload(true)} className="bg-green-500 text-white px-4 py-2 rounded">
                Upload CSV
            </Button>
            <Button onClick={downloadCsv} className="bg-blue-600 text-white px-4 py-2 rounded ml-2">
                Download CSV
            </Button>

            <Transition appear show={showCsvUpload} as={Fragment}>
                <Dialog as="div" open={showCsvUpload} onClose={() => setShowCsvUpload(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-center justify-center px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">Upload CSV</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setShowCsvUpload(false)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                                <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleCsvUpload(); }}>
                                            <div>
                                                <label htmlFor="csvFile">Upload CSV</label>
                                                <input id="csvFile" type="file" name="csvFile" accept=".csv" onChange={handleCsvFileChange} className="form-input" />
                                            </div>
                                            <button type="submit" className="btn btn-primary !mt-6">Submit</button>
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Add Page Modal */}
            <Dialog open={open} onClose={() => setOpen(false)} className="fixed inset-0 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                    <Input type="text" placeholder="Enter Page Name" value={pageName} onChange={(e) => setPageName(e.target.value)} />
                    <Input type="text" placeholder="Enter Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <div ref={editorRef} style={{ height: '300px' }} />
                    <Button onClick={() => setOpen(false)} className="bg-gray-500 text-white mt-4">Cancel</Button>
                    <Button onClick={handleSave} className="bg-blue-500 text-white mt-4 ml-2">Save</Button>
                </div>
            </Dialog>

            {/* Display Pages Alphabetically */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Saved Pages</h2>
                {Object.entries(Object.groupBy(pages, (page) => page.pageName.charAt(0).toUpperCase()))
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([letter, pageList]) => (
                        <div key={letter} className="mt-4">
                            <h3 className="text-lg font-bold">{letter}</h3>
                            <ul className="list-disc pl-5">
                                {pageList.sort((a, b) => a.pageName.localeCompare(b.pageName)).map((page) => (
                                    <li key={page._id}>
                                        <span
                                            className="text-blue-500 cursor-pointer underline"
                                            onClick={() => {
                                                setSelectedPage(page);
                                                setOpenViewModal(true);
                                            }}
                                        >
                                            {page.pageName}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
            </div>

            {/* View & Edit Page Modal */}
            {selectedPage && (
                <Dialog open={openViewModal} onClose={() => setOpenViewModal(false)} className="fixed inset-0 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                        <Input value={selectedPage.pageName} onChange={(e) => setSelectedPage({ ...selectedPage, pageName: e.target.value })} />
                        <Input value={selectedPage.title} onChange={(e) => setSelectedPage({ ...selectedPage, title: e.target.value })} />
                        <div ref={viewEditorRef} style={{ height: '300px' }} />
                        <div className="flex space-x-4 mt-4">
                            <Button onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</Button>
                            <Button onClick={handleUpdate} className="bg-yellow-500 text-white">Update</Button>
                            <Button onClick={handleDelete} className="bg-red-500 text-white">Delete</Button>
                        </div>
                    </div>
                </Dialog>
            )}
        </div>
    );
}