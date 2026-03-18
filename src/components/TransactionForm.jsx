import { useState } from "react";

function TransactionForm({ onAddTransaction }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !amount) {
      alert("Please fill all fields");
      return;
    }

    const transaction = {
      title,
      amount: Number(amount),
      type,
      category: type === "income" ? "Income" : "Expense",
      date: new Date().toLocaleDateString(),
    };

    onAddTransaction(transaction);

    setTitle("");
    setAmount("");
    setType("expense");
  };

  return (
    <div className="card">
      <h2>Add Transaction</h2>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <button type="submit">Add Transaction</button>
      </form>
    </div>
  );
}

export default TransactionForm;