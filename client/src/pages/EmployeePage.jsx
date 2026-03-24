import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./EmployeePage.css";

function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    role: "",
    contact: "",
    email: "",
    salary: "",
    paymentStatus: "Pending",
  });

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5174/employees");
      setEmployees(res.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    const loadEmployees = async () => {
      await fetchEmployees();
    };

    loadEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearForm = () => {
    setForm({
      employeeId: "",
      name: "",
      role: "",
      contact: "",
      email: "",
      salary: "",
      paymentStatus: "Pending",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        salary: Number(form.salary),
      };

      if (editingId) {
        await axios.put(`http://localhost:5174/employees/${editingId}`, payload);
      } else {
        await axios.post("http://localhost:5174/employees", payload);
      }

      clearForm();
      fetchEmployees();
    } catch (error) {
      console.error("Error saving employee:", error);
      alert(error?.response?.data?.message || "Error saving employee");
    }
  };

  const handleEdit = (employee) => {
    setForm({
      employeeId: employee.employeeId || "",
      name: employee.name || "",
      role: employee.role || "",
      contact: employee.contact || "",
      email: employee.email || "",
      salary: employee.salary || "",
      paymentStatus: employee.paymentStatus || "Pending",
    });
    setEditingId(employee._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5174/employees/${id}`);
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Error deleting employee");
    }
  };

  const filteredEmployees = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return employees;

    return employees.filter((emp) => {
      return (
        emp.employeeId?.toLowerCase().includes(term) ||
        emp.name?.toLowerCase().includes(term) ||
        emp.role?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term)
      );
    });
  }, [employees, search]);

  const totalEmployees = employees.length;
  const totalMonthlySalary = employees.reduce((sum, emp) => {
    return sum + (Number(emp.salary) || 0);
  }, 0);
  const pendingPayments = employees.filter(
    (emp) => emp.paymentStatus === "Pending"
  ).length;

  return (
    <div className="employee-layout">
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-badge">🏢</div>
          <div>
            <h2>Paramount</h2>
            <p>Enterprises</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          <a href="#" className="menu-link">
            📊 Dashboard
          </a>
          <a href="#" className="menu-link">
            👤 Customer
          </a>
          <a href="#" className="menu-link">
            🛒 Order
          </a>
          <a href="#" className="menu-link">
            🏬 Stock
          </a>
          <a href="#" className="menu-link">
            🚚 Suppliers
          </a>
          <a href="#" className="menu-link active">
            👨‍💼 Employees
          </a>
        </nav>

        <button className="logout-btn">↩ Logout</button>
      </aside>

      <main className="employee-main">
        <div className="page-header">
          <h1>Employee Management</h1>
          <p>Manage employees and track salary payments</p>
        </div>

        <section className="stats-row">
          <div className="stat-card">
            <div>
              <span className="stat-label">Total Employees</span>
              <h3>{totalEmployees}</h3>
            </div>
            <div className="stat-icon blue">👥</div>
          </div>

          <div className="stat-card">
            <div>
              <span className="stat-label">Total Monthly Salary</span>
              <h3>{totalMonthlySalary.toLocaleString()} LKR</h3>
            </div>
            <div className="stat-icon green">💲</div>
          </div>

          <div className="stat-card">
            <div>
              <span className="stat-label">Pending Payments</span>
              <h3>{pendingPayments}</h3>
            </div>
            <div className="stat-icon orange">📉</div>
          </div>
        </section>

        <section className="toolbar-card">
          <div className="toolbar">
            <input
              type="text"
              placeholder="search by name id or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-box"
            />
            <button className="add-btn" onClick={handleSubmit}>
              {editingId ? "Update Employee" : "+ Add Employee"}
            </button>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <input
              type="text"
              name="employeeId"
              placeholder="Employee ID"
              value={form.employeeId}
              onChange={handleChange}
            />
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
            />
            <input
              type="text"
              name="role"
              placeholder="Role"
              value={form.role}
              onChange={handleChange}
            />
            <input
              type="text"
              name="contact"
              placeholder="Contact"
              value={form.contact}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            <input
              type="number"
              name="salary"
              placeholder="Salary"
              value={form.salary}
              onChange={handleChange}
            />
            <select
              name="paymentStatus"
              value={form.paymentStatus}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>

            {editingId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={clearForm}
              >
                Cancel
              </button>
            )}
          </form>
        </section>

        <section className="table-card">
          <h2>All Employees</h2>

          <div className="table-wrap">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Salary</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp._id}>
                      <td>{emp.employeeId}</td>
                      <td>{emp.name}</td>
                      <td>{emp.role}</td>
                      <td>{emp.contact}</td>
                      <td>{emp.email}</td>
                      <td>{Number(emp.salary).toLocaleString()}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            emp.paymentStatus === "Paid"
                              ? "status-paid"
                              : "status-pending"
                          }`}
                        >
                          {emp.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(emp)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(emp._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="report-row">
          <button className="report-btn">Generate Report</button>
        </div>
      </main>
    </div>
  );
}

export default EmployeePage;