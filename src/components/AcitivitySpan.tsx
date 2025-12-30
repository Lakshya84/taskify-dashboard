import "../../index.css";

interface ActivitySpanProps {
  day: string;
}

const ActivitySpan: React.FC<ActivitySpanProps> = ({ day }) => {
  return (
    <>
      <span className="activity">{day}</span>
    </>
  );
};

export default ActivitySpan;
