import { useNavigate } from "react-router-dom";
import CreatePostModal from "../../components/post/CreatePostModal";

export function CreatePostPage() {
  const navigate = useNavigate();

  return (
    <CreatePostModal
      isOpen={true}
      onClose={() => navigate("/")}
    />
  );
}

export default CreatePostPage;
