import './Skeleton.css';

const Skeleton = ({ width, height, style, className }) => {
  return (
    <div className={`skeleton ${className || ''}`} style={{ width, height, ...style }}></div>
  );
};

export default Skeleton;