import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import disc from "./assets/disc.png";

function Login({ setUsername }) {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() === "") {
      alert("Please enter a username.");
      return;
    }
    setUsername(name);
    navigate("/chat");
  };

  return (
    <div className="login">
        <img src={disc} />
      <div className="">
        <form onSubmit={handleSubmit}>
          <h2 className="">Entrez votre pseudo !</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className=""
            placeholder="Diego"
          /><br></br><br></br>
          <button type="submit" className="">
            GO !
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
