// Imports

import { useDispatch, useSelector } from "react-redux";
import { fetchPostsAsync, postsSelector } from "../../Redux/Reducer/postsReducer";
import { useEffect } from "react";
import { ColorRing } from 'react-loader-spinner'
import Post from "../Post/Post";

// PostsList component to map the posts
function PostsList() {
    // Reducer's state
    const { posts, postsLoading } = useSelector(postsSelector);

    // Dispatcher
    const dispatch = useDispatch();

    // Dispatching action's
    useEffect(() => {
        dispatch(fetchPostsAsync());
    }, [])

    // Returning jsx
    return (
        <>
            <div className="">
                {postsLoading ? (<ColorRing
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="color-ring-loading"
                    wrapperStyle={{}}
                    wrapperClass="color-ring-wrapper"
                    colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
                />) :
                    posts.map((post) => (
                        <Post post={post} key={post.id} />
                    ))
                }
            </div>

        </>
    )
}

// Exporting PostsList
export default PostsList;