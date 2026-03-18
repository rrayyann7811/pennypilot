function TransactionList({ transactions, onDelete, onClearAll }) {
    return (
      <div className="card">
        <div className="list-header">
          <h2>Transaction History</h2>
          <button className="clear-btn" onClick={onClearAll}>
            Clear All
          </button>
        </div>
  
        {transactions.length === 0 ? (
          <p>No transactions added yet.</p>
        ) : (
          <div className="transaction-list">
            {transactions.map((item) => (
              <div key={item.id} className="transaction-item">
                <div>
                  <h4>{item.title}</h4>
                  <p>
                    {item.category} | {item.date}
                  </p>
                </div>
  
                <div className="transaction-right">
                  <span
                    className={
                      item.type === "income" ? "income-text" : "expense-text"
                    }
                  >
                    {item.type === "income" ? "+" : "-"} ₹ {item.amount}
                  </span>
                  <button onClick={() => onDelete(item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  export default TransactionList;