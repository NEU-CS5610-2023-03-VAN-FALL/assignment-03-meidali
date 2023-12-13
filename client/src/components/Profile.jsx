import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import '../style/profile.css';

const Profile = () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const { user } = useAuth0();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchProfile();
        }
    }, [isAuthenticated]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
      setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);

      try {
          const token = await getAccessTokenSilently();
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/profile`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(profile),
          });

          if (!response.ok) {
              throw new Error('Failed to update profile');
          }
          fetchProfile();
          setEditMode(false);
      } catch (error) {
          console.error('Error updating profile:', error);
      } finally {
          setIsLoading(false);
      }
  };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="profile">
            <h1>Profile</h1>
            <img src={user.picture} alt={user.name} className="profile-image"/>
            <p>Auth0Id: {user.sub}</p>
            {editMode ? (
                <form onSubmit={handleEditSubmit} className="profile-edit-form">
                    <div>
                        <label>Name:</label>
                        <input type="text" name="name" value={profile?.name || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input type="email" name="email" value={profile?.email || ''} onChange={handleInputChange} readOnly />
                    </div>
                    <div className="button-group">
                    <button type="submit" className="profile-button">Save Changes</button>
                    <button type="button" onClick={() => setEditMode(false)} className="profile-button">Cancel</button>
                    </div>
                </form>
            ) : (
                <div className="profile-info">
                    <p>Name: {profile?.name}</p>
                    <p>Email: {profile?.email}</p>
                    <button onClick={() => setEditMode(true)} className="profile-button">Edit Profile</button>
                </div>
            )}
            <div className="liked-items">
                <h3>Liked Items:</h3>
                {profile && (
                    <ul>
                        {profile.likes.map(like => (
                            <li key={like.menuItem.id}>{like.menuItem.name}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Profile;
