import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom"
import { useParams } from "react-router-dom";
import { followersSelector, getFollowingAsync, unfollowUserAsync } from "../../Redux/Reducer/followersReducer";
import { ColorRing } from "react-loader-spinner";

const FollowingList = () => {
    const dispatch = useDispatch();
    const { loading, following } = useSelector(followersSelector);
    const { userId } = useParams();

    useEffect(() => {
        dispatch(getFollowingAsync(userId));
    }, [dispatch, userId]);

    const unfollow = (followingId) => {
        // Implement your unfollow logic here
        dispatch(unfollowUserAsync(followingId));
    }

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <ColorRing
                visible={true}
                height={80}
                width={80}
                ariaLabel="color-ring-loading"
                color={'#e15b64'}
            />
        </div>
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">Following</h2>
            {following.length === 0 ? (
                <p className="text-gray-500">Not following anyone</p>
            ) : (
                <ul>
                    {following.map((followedUser) => (
                        <li key={followedUser._id} className="flex items-center mb-3">
                            <Link to={`/profile/${followedUser.following._id}`}>
                                <img src={followedUser.following.profilePic} alt={followedUser.following.name} className="w-12 h-12 rounded-full mr-2" />
                            </Link>

                            <div>
                                <span className="text-gray-800">{followedUser.following.name}</span>
                                <p className="text-sm text-gray-500">Followed since {new Date(followedUser.createdAt).toLocaleString()}</p>
                            </div>

                            <button onClick={() => unfollow(followedUser.following._id)} className="ml-auto bg-red-500 text-white rounded px-2 py-1">Unfollow</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FollowingList;

