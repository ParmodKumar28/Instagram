import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSinglePostAsync, postsSelector } from '../../../Redux/Reducer/postsReducer';
import { ColorRing } from 'react-loader-spinner';
import Post from '../../../Components/Post/Post';

const PostPage = () => {
    const { postId } = useParams();
    const dispatch = useDispatch();
    const { singlePost, singlePostLoading } = useSelector(postsSelector);

    useEffect(() => {
        dispatch(fetchSinglePostAsync(postId));
    }, [dispatch, postId]);

    // Check if single post is loading or if single post data is not available yet
    if (singlePostLoading || !singlePost) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ColorRing
                    visible={true}
                    height={80}
                    width={80}
                    ariaLabel="color-ring-loading"
                    color={'#e15b64'}
                />
            </div>
        );
    }

    // Render the Post component once data is available
    return (
        <div className='my-5'>
            <Post post={singlePost} />;
        </div>
    )
};

export default PostPage;
