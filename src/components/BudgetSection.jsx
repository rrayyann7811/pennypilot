function BudgetSection({ budget, setBudget, expenses }) {
    const remaining = budget - expenses;
    const percentage = budget > 0 ? Math.min((expenses / budget) * 100, 100) : 0;
  
    return (
      <div className="card budget-card">
        <h2>Monthly Budget</h2>
  
        <div className="budget-input-row">
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
        </div>
  
        <p>Total Budget: ₹ {budget}</p>
        <p>Total Expenses: ₹ {expenses}</p>
        <p>Remaining Budget: ₹ {remaining}</p>
  
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
  
        {expenses > budget && (
          <p className="warning-text">Warning: You have crossed your budget.</p>
        )}
      </div>
    );
  }
  
  export default BudgetSection;