import React from 'react';
import "./table.css"

const RoleTable = ({ roles }) => {
  return (
    // Use new container class
    <div className="data-table-container">
      {/* Use new header classes with modifier */}
      <div className="data-table-header data-table-header--roles">
        <h2 className="data-table-header__title">Roles</h2>
        <p className="data-table-header__description">
          A list of all roles in the system with their permissions.
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
                Name
              </th>
              <th scope="col" className="data-table__header-cell">
                Description
              </th>
              <th scope="col" className="data-table__header-cell">
                Permissions
              </th>
              <th scope="col" className="data-table__header-cell">
                Created At
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.length > 0 ? (
              roles.map((role) => (
                // Use new row class
                <tr key={role._id} className="data-table__row">
                  {/* Use new cell class */}
                  <td className="data-table__cell data-table__cell--nowrap">
                    <div className="cell-text-main">{role.name}</div>
                    <div className="cell-text-subtle">{role._id}</div>
                  </td>
                  <td className="data-table__cell">
                    {/* Use main text style */}
                    <div className="cell-text-main">{role.description}</div>
                  </td>
                  <td className="data-table__cell">
                    {/* Use badge container and specific badge class */}
                    <div className="data-table-badge-container">
                      {role.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="data-table-badge data-table-badge--permission"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="data-table__cell data-table__cell--nowrap data-table__cell--muted">
                    {new Date(role.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="data-table__row">
                {/* Use cell class with empty modifier */}
                <td colSpan="4" className="data-table__cell data-table__cell--empty">
                  No roles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleTable;