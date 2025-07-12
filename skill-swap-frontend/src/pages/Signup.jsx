// import React, { useState } from 'react';
// import API from '../api/axios';
// import { useNavigate } from 'react-router-dom';

// const Signup = () => {
//   const [form, setForm] = useState({ name: '', email: '', password: '' });
//   const [message, setMessage] = useState('');
//   const navigate = useNavigate();

//   const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async e => {
//     e.preventDefault();
//     try {
//       const res = await API.post('/auth/signup', form);
//       localStorage.setItem('token', res.data.token);
//       localStorage.setItem('userId', res.data.user.id);
//       navigate('/dashboard');
//     } catch (err) {
//       setMessage("Signup failed: " + err.response?.data?.message);
//     }
//   };

//   return (
//     <div className="p-8 max-w-md mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input name="name" type="text" placeholder="Name" onChange={handleChange} className="w-full border p-2" />
//         <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full border p-2" />
//         <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full border p-2" />
//         <button className="bg-blue-500 text-white px-4 py-2 rounded">Sign Up</button>
//       </form>
//       <p className="text-green-600 mt-2">{message}</p>
//       <p className="text-sm mt-2">Already have an account? <a className="text-blue-500 underline" href="/login">Login</a></p>
//     </div>
//   );
// };

// export default Signup;
import React, { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();

    console.log("Form Data:", form); // ✅ LOG: What you're sending to backend

    try {
      const res = await API.post('/auth/signup', form);

      console.log("Signup Response:", res.data); // ✅ LOG: Response from backend

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user.id);
      navigate('/dashboard');
    } catch (err) {
      console.log("Signup Error:", err); // ✅ LOG: Full error object
      setMessage("Signup failed: " + (err.response?.data?.message || "Unexpected error"));
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" type="text" placeholder="Name" onChange={handleChange} className="w-full border p-2" />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full border p-2" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full border p-2" />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Sign Up</button>
      </form>
      <p className="text-green-600 mt-2">{message}</p>
      <p className="text-sm mt-2">Already have an account? <a className="text-blue-500 underline" href="/login">Login</a></p>
    </div>
  );
};

export default Signup;
