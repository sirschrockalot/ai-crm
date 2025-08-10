import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { ProjectTaskSelector } from '../../../components/time-tracking/ProjectTaskSelector';

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('ProjectTaskSelector', () => {
  const mockProjects = [
    { _id: '1', name: 'Project Alpha' },
    { _id: '2', name: 'Project Beta' },
  ];

  const mockTasks = [
    { _id: '1', name: 'Task 1', projectId: '1' },
    { _id: '2', name: 'Task 2', projectId: '1' },
  ];

  const mockOnProjectChange = jest.fn();
  const mockOnTaskChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithChakra(
      <ProjectTaskSelector
        projects={mockProjects}
        tasks={mockTasks}
        selectedProject=""
        selectedTask=""
        onProjectChange={mockOnProjectChange}
        onTaskChange={mockOnTaskChange}
      />
    );
    expect(screen.getByLabelText(/Project/i)).toBeInTheDocument();
  });

  it('displays project selection dropdown', () => {
    renderWithChakra(
      <ProjectTaskSelector
        projects={mockProjects}
        tasks={mockTasks}
        selectedProject=""
        selectedTask=""
        onProjectChange={mockOnProjectChange}
        onTaskChange={mockOnTaskChange}
      />
    );
    expect(screen.getByLabelText(/Project/i)).toBeInTheDocument();
  });

  it('displays task selection dropdown', () => {
    renderWithChakra(
      <ProjectTaskSelector
        projects={mockProjects}
        tasks={mockTasks}
        selectedProject=""
        selectedTask=""
        onProjectChange={mockOnProjectChange}
        onTaskChange={mockOnTaskChange}
      />
    );
    expect(screen.getByLabelText(/Task/i)).toBeInTheDocument();
  });
});
