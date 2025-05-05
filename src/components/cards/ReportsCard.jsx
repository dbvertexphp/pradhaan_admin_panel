import React from "react";
import { doc, deleteDoc, getDocs, collection, query, where, } from 'firebase/firestore';
import { useFirebase } from "../../context/firebase";
import { toast } from "react-toastify";
import { deleteObject, getStorage, ref } from "firebase/storage";

const ReportsCard = ({ post, setRefreshReports, by, reasonCounts, reportsCount, reportId }) => {
    const { post_image, post_video, full_add, post_id, post_desc } = post;
    const { firestore } = useFirebase();

    console.log(post, "reportsssse")

    // const handleDeleteReport = async (id) => {
    //     // Assuming 'reports' and 'posts' are the names of the collections
    //     const reportsCollectionName = 'reports';
    //     const postsCollectionName = 'posts';
    //     const postIdToDelete = id;

    //     try {
    //         // Step 1: Find the document with the matching postId in 'reports' collection
    //         const reportsCollectionRef = collection(firestore, reportsCollectionName);
    //         const reportsQuerySnapshot = await getDocs(query(reportsCollectionRef, where('postId', '==', postIdToDelete)));

    //         // Step 2: Delete the document from 'reports' collection
    //         const deleteReportsPromises = reportsQuerySnapshot.docs.map(async (reportDoc) => {
    //             await deleteDoc(reportDoc.ref);
    //             console.log(`Document with postId ${postIdToDelete} deleted from 'reports' collection successfully.`);
    //         });

    //         // Step 3: Find the document with the matching postId in 'posts' collection
    //         const postsCollectionRef = collection(firestore, postsCollectionName);
    //         const postsQuerySnapshot = await getDocs(query(postsCollectionRef, where('post_id', '==', postIdToDelete)));

    //         // Step 4: Delete the document from 'posts' collection
    //         const deletePostsPromises = postsQuerySnapshot.docs.map(async (postDoc) => {
    //             await deleteDoc(postDoc.ref);
    //             console.log(`Document with postId ${postIdToDelete} deleted from 'posts' collection successfully.`);
    //         });

    //         // Wait for all deletions to complete
    //         await Promise.all([...deleteReportsPromises, ...deletePostsPromises]);

    //         setRefreshReports(true)

    //         // Display toast after all deletions are complete
    //         toast("Post deleted successfully");
    //     } catch (error) {
    //         console.error(`Error deleting documents: `, error);
    //         // Handle error or display an error toast
    //     }
    // };



    const handleDeleteReport = async (id) => {
        // Assuming 'reports' and 'posts' are the names of the collections
        const reportsCollectionName = 'reports';
        const postsCollectionName = 'posts';
        const postIdToDelete = id;

        try {
            // Step 1: Find the document with the matching postId in 'reports' collection
            const reportsCollectionRef = collection(firestore, reportsCollectionName);
            const reportsQuerySnapshot = await getDocs(query(reportsCollectionRef, where('postId', '==', postIdToDelete)));

            // Step 2: Delete the document from 'reports' collection
            const deleteReportsPromises = reportsQuerySnapshot.docs.map(async (reportDoc) => {
                await deleteDoc(reportDoc.ref);
                console.log(`Document with postId ${postIdToDelete} deleted from 'reports' collection successfully.`);
            });

            // Step 3: Find the document with the matching postId in 'posts' collection
            const postsCollectionRef = collection(firestore, postsCollectionName);
            const postsQuerySnapshot = await getDocs(query(postsCollectionRef, where('post_id', '==', postIdToDelete)));

            // Step 4: Delete the document from 'posts' collection
            const deletePostsPromises = postsQuerySnapshot.docs.map(async (postDoc) => {
                // Delete post data from Firestore
                await deleteDoc(postDoc.ref);
                console.log(`Document with postId ${postIdToDelete} deleted from 'posts' collection successfully.`);

                // Get the post data
                const postData = postDoc.data();
                console.log(postData, "deletePostData")
                const storage = getStorage();

                // Delete associated image or video from Firebase Storage
                if (postData.post_image) {
                    const imageRef = ref(storage, `posts/${postData.post_id}`);
                    await deleteObject(imageRef);
                    console.log(`Image ${postData.imageURL} deleted from Firebase Storage successfully.`);
                }
                if (postData.post_video) {
                    const videoRef = ref(storage, `posts/${postData.post_id}`);
                    await deleteObject(videoRef);
                    console.log(`Video ${postData.videoURL} deleted from Firebase Storage successfully.`);
                }
            });

            // Wait for all deletions to complete
            await Promise.all([...deleteReportsPromises, ...deletePostsPromises]);

            setRefreshReports(true);

            // Display toast after all deletions are complete
            toast("Post deleted successfully");
        } catch (error) {
            console.error(`Error deleting documents: `, error);
            // Handle error or display an error toast
        }
    };



    const handleKeepReport = async (postId) => {
        // Assuming 'reports' is the name of the collection
        const reportsCollectionName = 'reports';

        try {
            // Step 1: Find the document with the matching postId in 'reports' collection
            const reportsCollectionRef = collection(firestore, reportsCollectionName);
            const reportsQuerySnapshot = await getDocs(query(reportsCollectionRef, where('postId', '==', postId)));

            // Step 2: Delete the document from 'reports' collection
            const deleteReportsPromises = reportsQuerySnapshot.docs.map(async (reportDoc) => {
                await deleteDoc(reportDoc.ref);
                console.log(`Document with postId ${postId} deleted from 'reports' collection successfully.`);
            });

            // Wait for all deletions to complete
            await Promise.all(deleteReportsPromises);

            setRefreshReports(true);

            // Display toast after all deletions are complete
            toast("Report kept successfully");
        } catch (error) {
            console.error(`Error deleting documents: `, error);
            // Handle error or display an error toast
        }
    };



    return (
        <div key={reportId} className="min-w-[1300px] max-w-[1300px] my-5 px-10 mx-10  bg-white rounded-md overflow-hidden shadow-md">
            {/* {post_video && (
                <div className="relative h-96">
                    <video
                        className="w-full h-full object-cover"
                        controls
                        src={post_video}
                        type="video/mp4"
                    />
                </div>
            )}

            {post_image && !post_video && (
                <img
                    className="w-full h-96 object-cover"
                    src={post_image}
                    alt="Post Image"
                />
            )}

            <div className="px-6 py-4">
                <span className="font-bold text-xl mb-2">Address:</span>
                <span className="text-gray-700 text-base ml-1">
                    {full_add.join(", ")}
                </span>
            </div>
            <div className="px-6 py-4">
                <button onClick={() => handleDeleteReport(post_id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    Delete
                </button>
            </div> */}

            <div className="px-6 py-4 flex gap-5" >
                {/* <div className="w-[700px] h-80">
                    <img
                        className="w-full h-full object-cover"
                        src={post_image}
                        alt="Post Image"
                    />
                </div> */}

                {post_video && (
                    <div className="relative w-[700px] h-80">
                        <video
                            className="w-full h-full object-contain"
                            controls
                            src={post_video}
                            type="video/mp4"
                        />
                    </div>
                )}

                {post_image && !post_video && (
                    <div className="w-[700px] h-80">
                        <img
                            className="w-full h-full object-contain"
                            src={post_image}
                            alt="Post Image"
                        />
                    </div>
                )}

                <div className="flex flex-col">
                    <p className="border-b-4 pb-3 font-semibold">Total Reports:<span className="ml-1">{reportsCount}</span></p>
                    <div className="flex gap-7 mt-8 flex-wrap">
                        {Object.entries(reasonCounts).map(([reason, count]) => (
                            <p key={reason}>{reason}:<span className="ml-1">{count}</span></p>
                        ))}
                    </div>

                    <div className="my-5">
                        <p className="font-semibold">Post Content:<span className="ml-1 font-normal">{post_desc}</span></p>
                    </div>

                    <div className="flex gap-10 mt-[120px]">
                        <button className="px-10 py-3 rounded-md text-white bg-green-600" onClick={() => handleKeepReport(post_id)}>Keep</button>

                        <button onClick={() => handleDeleteReport(post_id)} className="px-10 py-3 rounded-md text-white bg-red-600">Delete</button>
                    </div>

                </div>



            </div>
        </div>
    );
};

export default ReportsCard;
