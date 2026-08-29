import { ColorRing } from "react-loader-spinner";

export const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[70vh]">
    <ColorRing
      visible={true}
      height="60"
      width="60"
      ariaLabel="loading"
      colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
    />
  </div>
);

export default PageLoader;
