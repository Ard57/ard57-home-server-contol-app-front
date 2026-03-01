
import { useAuth } from "../auth/useAuth";
import {
  Avatar,
  Button,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';
import { useState } from "react";

function Auth() {
  const { user, signIn, signOut: logOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSignOut = () => {
    logOut();
    handleCloseMenu();
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 0, zIndex: 100 }}>
      {user ? (
        <>
          <IconButton
            onClick={handleMenu}
            sx={{
              p: 0,
              '&:hover': {
                boxShadow: '0 0 10px 2px rgba(255, 255, 255, 0.5)',
                transition: 'box-shadow 0.3s ease-in-out',
              },
            }}
          >
            <Avatar alt={user.displayName || 'User'} src={user.photoURL || undefined} />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
              <MenuItem >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                          alt={user.displayName || 'User'}
                          src={user.photoURL || undefined}
                          sx={{ width: 56, height: 56, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h6">{user.displayName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                  </Box>
              </MenuItem>
              <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
            </Menu>
          </>
        ) : (
          <Button
              variant="contained"
              startIcon={<GoogleIcon />}
              onClick={signIn}
              sx={{
                '&:hover': {
                  boxShadow: '0 0 10px 2px rgba(25, 118, 210, 0.5)',
                  transition: 'box-shadow 0.3s ease-in-out',
                },
              }}
          >
              Sign in
          </Button>
        )}
      </Box>
  );
}

export default Auth;
