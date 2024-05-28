import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { followersSelector, getFollowersAsync, removeFollowerAsync } from "../../Redux/Reducer/followersReducer";
import { Link, useParams } from "react-router-dom";
import { ColorRing } from "react-loader-spinner";
import Cookies from "js-cookie";

const FollowerList = () => {
    const dispatch = useDispatch();
    const { loading, followers: initialFollowers } = useSelector(followersSelector);
    const { userId } = useParams();
    const [signedUser, setSignedUser] = useState("");
    const [followers, setFollowers] = useState([]);

    useEffect(() => {
        setSignedUser(Cookies.get("userId"));
    }, []);

    useEffect(() => {
        dispatch(getFollowersAsync(userId));
    }, [dispatch, userId]);

    useEffect(() => {
        setFollowers(initialFollowers);
    }, [initialFollowers]);

    const removeFollower = (followerId) => {
        // Optimistically update the followers list
        setFollowers(followers.filter(follower => follower.follower._id !== followerId));
        
        // Dispatch the remove follower action
        dispatch(removeFollowerAsync(followerId));
    };

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
                                <img src={follower.follower.profilePic || "https://placekitten.com/200/200"} alt={follower.follower.name} className="w-10 h-10 rounded-full mr-2" />
                            </Link>
                            <div>
                                <span className="text-gray-800">{follower.follower.name}</span>
                                <p className="text-sm text-gray-500">Followed on {new Date(follower.createdAt).toLocaleString()}</p>
                            </div>
                            {signedUser === userId && (
                                <button 
                                    onClick={() => removeFollower(follower.follower._id)} 
                                    className="ml-auto bg-red-500 text-white rounded px-2 py-1">
                                    Remove Follower
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FollowerList;
