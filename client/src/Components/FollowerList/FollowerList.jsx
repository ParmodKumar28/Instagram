import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { followersSelector, getFollowersAsync, removeFollowerAsync } from "../../Redux/Reducer/followersReducer";
import { Link, useParams } from "react-router-dom";
import { ColorRing } from "react-loader-spinner";

const FollowerList = () => {
    const dispatch = useDispatch();
    const { loading, followers } = useSelector(followersSelector);
    const { userId } = useParams();
    const [signedUser, setSignedUser] = useState("");

    useEffect(() => {
        setSignedUser(localStorage.getItem("signedUser"));
    }, [])

    useEffect(() => {
        dispatch(getFollowersAsync(userId));
    }, [dispatch, userId]); // Removed 'followers' from the dependency array

    const removeFollower = (followerId) => {
        dispatch(removeFollowerAsync(followerId))
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
            <h2 className="text-lg font-semibold mb-4">Followers</h2>
            {followers.length === 0 ? (
                <p className="text-gray-500">0 followers</p>
            ) : (
                <ul>
                    {followers.map((follower) => (
                        <li key={follower._id} className="flex items-center mb-3">
                            <Link to={`/profile/${follower.follower._id}`}>
                                <img src={follower.follower.profilePic} alt={follower.follower.name} className="w-10 h-10 rounded-full mr-2" />
                            </Link>
                            <div>
                                <span className="text-gray-800">{follower.follower.name}</span>
                                <p className="text-sm text-gray-500">Followed on {new Date(follower.createdAt).toLocaleString()}</p>
                            </div>
                            {signedUser === userId ? <button onClick={() => removeFollower(follower.follower._id)} className="ml-auto bg-red-500 text-white rounded px-2 py-1">Remove Follower</button> : null}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FollowerList;
