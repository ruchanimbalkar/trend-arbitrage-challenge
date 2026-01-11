//import styles
import "./Card.css";
export default function Card({ title, score }) {
  return (
    <div className="card-div">
      <h3>Trend Title : {title}</h3>
      <h4> Trend Score : {score} </h4>
    </div>
  );
}
