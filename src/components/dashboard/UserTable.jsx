import React from 'react';
import "./table.css";


const UserTable = ({ users }) => {
  return (
     // Use new container class
    <div className="data-table-container">
       {/* Use new header classes with modifier */}
      <div className="data-table-header data-table-header--users">
        <h2 className="data-table-header__title">Users</h2>
        <p className="data-table-header__description">
          A list of all users in the system with their roles.
        </p>
      </div>
       {/* Use new wrapper class */}
      <div className="data-table-wrapper">
         {/* Use new table class */}
        <table className="data-table">
          <thead>
            <tr>
              {/* Use new header cell class */}
              <th scope="col" className="data-table__header-cell">
                User
              </th>
              <th scope="col" className="data-table__header-cell">
                Email
              </th>
              <th scope="col" className="data-table__header-cell">
                Contact
              </th>
              <th scope="col" className="data-table__header-cell">
                Role
              </th>
              <th scope="col" className="data-table__header-cell">
                Created At
              </th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((user) => (
                 // Use new row class
                <tr key={user._id} className="data-table__row">
                   {/* Use new cell class */}
                  <td className="data-table__cell data-table__cell--nowrap">
                    {/* Use specific user info classes */}
                    <div className="user-info">
                      <div className="user-avatar">
                        <span className="user-avatar__initials">
                          {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                        </span>
                      </div>
                      <div className="user-details">
                        <div className="cell-text-main">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="cell-text-subtle">
                          @{user.user_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="data-table__cell data-table__cell--nowrap">
                    <div className="cell-text-main">{user.email}</div>
                  </td>
                  <td className="data-table__cell data-table__cell--nowrap">
                    <div className="cell-text-main">{user.contact_number}</div>
                  </td>
                  <td className="data-table__cell data-table__cell--nowrap">
                     {/* Use specific badge class */}
                    <span className="data-table-badge data-table-badge--role">
                      {user.role ? user.role.name : 'Unknown Role'}
                    </span>
                  </td>
                  <td className="data-table__cell data-table__cell--nowrap data-table__cell--muted">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="data-table__row">
                 {/* Use cell class with empty modifier */}
                <td colSpan="5" className="data-table__cell data-table__cell--empty">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;