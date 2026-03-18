function SummaryCard({ title, amount }) {
    return (
      <div className="card summary-card">
        <h3>{title}</h3>
        <p>₹ {amount}</p>
      </div>
    );
  }
  
  export default SummaryCard;