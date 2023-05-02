import Button from 'Components/button';
import { useAuth } from 'context/auth-context';
import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const HeaderStyle = styled.div`
  margin: 20px 0;
  .header-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .header-left {
      display: flex;
      align-items: center;
      .logo {
        display: block;
        max-width: 50px;
        margin-right: 30px;
      }
      .menu {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 50px;
        list-style: none;
      }
      a {
        font-family: 'Poppins';
        font-style: normal;
        font-weight: 500;
        font-size: 18px;
      }
    }
    .header-right {
      display: flex;
      align-items: center;
      .search-container {
        display: flex;
        align-items: center;
        border: 1px solid #cfcfcf;
        border-radius: 10px;
        padding: 15px 25px;
        margin-right: 20px;
        .search-icon {
          padding: 5px;
          margin-left: 10px;
          cursor: pointer;
        }
      }
    }
  }
`;
const navs = [
  {
    name: 'Menu',
  },
  {
    name: 'Blog',
  },
  {
    name: 'Contact',
  },
];
const getLastName = name => {
  if (name) {
    const length = name.split(' ').length;
    return name.split(' ')[length - 1];
  }
  return ''
};
const Header = () => {
  //Láy userInfor trong Auth Context
  const { userInfo } = useAuth();
  // console.log('userInfo:', userInfo.displayName);
  return (
    <HeaderStyle>
      <div className="container">
        <div className="header-main">
        <div className="header-left">
            <NavLink href="/">
              <img className="logo" srcSet="/img/logo.png 3x" alt="logo" />
            </NavLink>
            <ul className="menu">
              {navs?.length > 0 &&
                navs.map((nav, index) => {
                  return (
                    <li key={index}>
                      <NavLink href="/">{nav.name}</NavLink>
                    </li>
                  );
                })}
            </ul>
          </div>
          <div className="header-right">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search Posts"
              />
              <span className="search-icon">
                <svg
                  width="18"
                  height="17"
                  viewBox="0 0 18 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <ellipse
                    cx="7.66669"
                    cy="7.05161"
                    rx="6.66669"
                    ry="6.05161"
                    stroke="#999999"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M17.0001 15.5237L15.2223 13.9099L14.3334 13.103L12.5557 11.4893"
                    stroke="#999999"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M11.6665 12.2964C12.9671 12.1544 13.3706 11.8067 13.4443 10.6826"
                    stroke="#999999"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>
            {!userInfo ? (
              <Button
                type="button"
                className="header-button"
                width="200px"
                to="/sign-in">
                Sign In
              </Button>
            ) : (
              <Button className="header-button" width="200px">
                {`Welcome back, ${getLastName(userInfo?.displayName)}`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </HeaderStyle>
  );
};

export default Header;
