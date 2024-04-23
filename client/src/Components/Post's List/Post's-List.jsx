import { useDispatch, useSelector } from "react-redux";
import { fetchPostsAsync, postsSelector } from "../../Redux/Reducer/postsReducer";
import { useEffect } from "react";
import { ColorRing } from 'react-loader-spinner';
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
            {postsLoading ? (
                <div className="flex justify-center items-center h-screen">
                    <ColorRing
                        visible={true}
                        height={80}
                        width={80}
                        ariaLabel="color-ring-loading"
                        color={'#e15b64'}
                    />
                </div>
            ) : (
                <div className="post-list-container flex flex-col gap-5 my-5 py-5">
                    {posts.map((post) => (
                        <Post post={post} key={post.id} />
                    ))}
                </div>
            )}
        </>
    );
}

// Exporting PostsList
export default PostsList;
