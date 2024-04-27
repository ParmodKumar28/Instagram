import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Post from '../../../Components/Post/Post';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSinglePostAsync, postsSelector } from '../../../Redux/Reducer/postsReducer';

const PostPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { singlePost, singlePostLoading } = useSelector(postsSelector);

    useEffect(() => {
        dispatch(fetchSinglePostAsync(id));
    }, [dispatch, id])

    return (
        <div>
            {singlePostLoading ? "Loading..." : < Post post={singlePost} />}
        </div>
    )
}

export default PostPage