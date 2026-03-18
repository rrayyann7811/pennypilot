import { useEffect, useMemo, useState } from "react";
import SummaryCard from "./components/SummaryCard";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import BudgetSection from "./components/BudgetSection";

function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [budget, setBudget] = useState(() => {
    const savedBudget = localStorage.getItem("budget");
    return savedBudget ? Number(savedBudget) : 10000;
  });

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("budget", budget);
  }, [budget]);

  const income = useMemo(() => {
    return transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount), 0);
  }, [transactions]);

  const expenses = useMemo(() => {
    return transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount), 0);
  }, [transactions]);

  const balance = income - expenses;

  const addTransaction = (newTransaction) => {
    setTransactions((prev) => [{ id: Date.now(), ...newTransaction }, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllData = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to clear all transactions?"
    );
    if (confirmDelete) {
      setTransactions([]);
    }
  };

  return (
    <div className="app">
      <header className="header">
      <h1>PennyPilot</h1>
<p>Track your income, expenses, and monthly budget easily</p>
      </header>

      <section className="summary-grid">
        <SummaryCard title="Total Income" amount={income} />
        <SummaryCard title="Total Expenses" amount={expenses} />
        <SummaryCard title="Balance" amount={balance} />
      </section>

      <BudgetSection
        budget={budget}
        setBudget={setBudget}
        expenses={expenses}
      />

      <div className="main-grid">
        <TransactionForm onAddTransaction={addTransaction} />
        <TransactionList
          transactions={transactions}
          onDelete={deleteTransaction}
          onClearAll={clearAllData}
        />
      </div>
    </div>
  );
}

export default App;