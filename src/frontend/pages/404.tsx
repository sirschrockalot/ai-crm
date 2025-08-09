import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const Custom404: React.FC = () => {
  const router = useRouter();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <VStack spacing={8} textAlign="center" maxW="md">
        {/* 404 Illustration */}
        <Box position="relative">
          <Heading
            size="9xl"
            color="blue.500"
            opacity={0.1}
            position="absolute"
            top="-50%"
            left="50%"
            transform="translateX(-50%)"
          >
            404
          </Heading>
          <Box
            w="200px"
            h="200px"
            bg="blue.500"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            zIndex={1}
          >
            <Text fontSize="6xl" color="white" fontWeight="bold">
              404
            </Text>
          </Box>
        </Box>

        {/* Error Message */}
        <VStack spacing={4}>
          <Heading size="lg" color="gray.800">
            Page Not Found
          </Heading>
          <Text color={textColor} fontSize="lg">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
          </Text>
        </VStack>

        {/* Action Buttons */}
        <VStack spacing={4} w="full">
          <Button
            leftIcon={<FiHome />}
            colorScheme="blue"
            size="lg"
            onClick={handleGoHome}
            w="full"
          >
            Go to Dashboard
          </Button>
          <Button
            leftIcon={<FiArrowLeft />}
            variant="outline"
            size="lg"
            onClick={handleGoBack}
            w="full"
          >
            Go Back
          </Button>
        </VStack>

        {/* Help Text */}
        <Text color={textColor} fontSize="sm">
          If you believe this is an error, please contact support.
        </Text>
      </VStack>
    </Box>
  );
};

export default Custom404;
