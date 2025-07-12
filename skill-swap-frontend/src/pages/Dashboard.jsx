// import React, { useEffect, useState } from 'react';
// import API from '../api/axios';

// const Dashboard = () => {
//   const [user, setUser] = useState(null);
//   const userId = localStorage.getItem('userId');

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await API.get(`/users/${userId}`);
//         setUser(res.data);
//       } catch (err) {
//         console.error("Failed to load user", err);
//       }
//     };
//     fetchUser();
//   }, [userId]);

//   if (!user) return <div className="p-8">Loading dashboard...</div>;

//   return (
//     <div className="p-8">
//       <h2 className="text-xl font-bold mb-2">Welcome, {user.name}</h2>
//       <p>Email: {user.email}</p>
//       <p>Location: {user.location || "Not set"}</p>
//       <p>Availability: {user.availability || "Not set"}</p>
//     </div>
//   );
// };

// export default Dashboard;
import React, { useEffect, useState } from 'react';
import API from '../api/axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get('/users/me');
        setUser(res.data);
      } catch (err) {
        console.error("Failed to load user", err);
        setError("Could not load user info.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}</h2>
      <div className="bg-white shadow p-4 rounded space-y-2">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Location:</strong> {user.location || "Not set"}</p>
        <p><strong>Availability:</strong> {user.availability || "Not set"}</p>
        <p><strong>Profile Visibility:</strong> {user.isPublic ? "Public" : "Private"}</p>
      </div>
    </div>
  );
};

export default Dashboard;
