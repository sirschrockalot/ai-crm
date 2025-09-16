import React from 'react';
import { Box } from '@chakra-ui/react';
import UserProfile from '../components/auth/UserProfile/UserProfile';
import MainLayout from '../components/layout/MainLayout/MainLayout';

const ProfilePage: React.FC = () => {
  return (
    <MainLayout>
      <Box px={4} py={6}>
        <UserProfile />
      </Box>
    </MainLayout>
  );
};

export default ProfilePage;


