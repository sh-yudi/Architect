import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { IntakeWizard } from '@/components/wizard/IntakeWizard';
import StartPage from '@/app/start/page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('IntakeWizard Component', () => {
  it('should render step 1 (Plot Details) initially and allow entering dimensions', () => {
    const { getByLabelText, getByText } = render(<IntakeWizard onSubmit={vi.fn()} />);

    expect(getByText('Step 1 of 6: Plot Details')).toBeDefined();
    const widthInput = getByLabelText('Plot Width (ft)') as HTMLInputElement;
    fireEvent.change(widthInput, { target: { value: '35' } });
    expect(widthInput.value).toBe('35');

    const lengthInput = getByLabelText('Plot Length (ft)') as HTMLInputElement;
    fireEvent.change(lengthInput, { target: { value: '55' } });
    expect(lengthInput.value).toBe('55');
  });

  it('should navigate through all 6 steps and allow updating inputs', () => {
    const { getByText, getByLabelText } = render(<IntakeWizard onSubmit={vi.fn()} />);

    // Step 1 -> Step 2
    expect(getByText('Step 1 of 6: Plot Details')).toBeDefined();
    fireEvent.click(getByText(/Continue/));

    // Step 2: House Requirements
    expect(getByText('Step 2 of 6: House Requirements')).toBeDefined();
    expect(getByText('House Rooms & Structure')).toBeDefined();
    const bedroomsInput = getByLabelText('Bedrooms') as HTMLInputElement;
    fireEvent.change(bedroomsInput, { target: { value: '4' } });
    expect(bedroomsInput.value).toBe('4');
    fireEvent.click(getByText(/Continue/));

    // Step 3: Lifestyle Preferences
    expect(getByText('Step 3 of 6: Lifestyle Preferences')).toBeDefined();
    expect(getByText('Façade & Style')).toBeDefined();
    const styleSelect = getByLabelText('Architectural Elevation Style') as HTMLSelectElement;
    fireEvent.change(styleSelect, { target: { value: 'Traditional' } });
    expect(styleSelect.value).toBe('Traditional');
    fireEvent.click(getByText(/Continue/));

    // Step 4: Budget & Materials
    expect(getByText('Step 4 of 6: Budget & Materials')).toBeDefined();
    expect(getByText('Budget & Materials')).toBeDefined();
    const budgetSelect = getByLabelText('Target Budget Range') as HTMLSelectElement;
    fireEvent.change(budgetSelect, { target: { value: '40-60L' } });
    expect(budgetSelect.value).toBe('40-60L');
    fireEvent.click(getByText(/Continue/));

    // Step 5: Authority & Legal
    expect(getByText('Step 5 of 6: Authority & Legal')).toBeDefined();
    expect(getByText('Municipal Approval Information')).toBeDefined();
    const ownerInput = getByLabelText('Owner Full Name (on Registry)') as HTMLInputElement;
    fireEvent.change(ownerInput, { target: { value: 'Rajesh Kumar' } });
    expect(ownerInput.value).toBe('Rajesh Kumar');
    fireEvent.click(getByText(/Continue/));

    // Step 6: Review & Generate
    expect(getByText('Step 6 of 6: Review & Generate')).toBeDefined();
    expect(getByText('Review & Generate Blueprint')).toBeDefined();
    expect(getByText(/Traditional/)).toBeDefined();
  });

  it('should navigate backward when Back button is clicked', () => {
    const { getByText } = render(<IntakeWizard onSubmit={vi.fn()} />);

    expect(getByText('Step 1 of 6: Plot Details')).toBeDefined();
    fireEvent.click(getByText(/Continue/));
    expect(getByText('Step 2 of 6: House Requirements')).toBeDefined();

    fireEvent.click(getByText(/Back/));
    expect(getByText('Step 1 of 6: Plot Details')).toBeDefined();
  });

  it('should submit form data when Generate button is clicked on Step 6', () => {
    const handleSubmit = vi.fn();
    const { getByText, getByLabelText } = render(<IntakeWizard onSubmit={handleSubmit} />);

    // Change plot width on step 1
    const widthInput = getByLabelText('Plot Width (ft)') as HTMLInputElement;
    fireEvent.change(widthInput, { target: { value: '40' } });

    // Advance to step 6
    for (let i = 0; i < 5; i++) {
      fireEvent.click(getByText(/Continue/));
    }

    expect(getByText('Step 6 of 6: Review & Generate')).toBeDefined();
    const generateBtn = getByText('Generate Complete House Plan Package');
    fireEvent.click(generateBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    const submittedData = handleSubmit.mock.calls[0][0];
    expect(submittedData.plot.width).toBe(40);
  });

  it('should capture custom wishlist and allow dynamic multi-floor selection up to 6+ floors', () => {
    const handleSubmit = vi.fn();
    const { getByText, getByLabelText } = render(<IntakeWizard onSubmit={handleSubmit} />);

    // Enter detailed vision in Step 1
    const wishlistArea = getByLabelText(/Describe Your Dream House in Your Own Words/) as HTMLTextAreaElement;
    fireEvent.change(wishlistArea, {
      target: { value: 'Double height living room facing North-East with rooftop pool and modern kitchen.' },
    });
    expect(wishlistArea.value).toContain('Double height living room');

    fireEvent.click(getByText(/Continue/));

    // Step 2: Select 4 floors via quick preset
    expect(getByText('G + 3')).toBeDefined();
    fireEvent.click(getByText('G + 3'));

    // Or type custom floors
    const floorsInput = getByLabelText('Number of Floors') as HTMLInputElement;
    expect(floorsInput.value).toBe('4');

    fireEvent.change(floorsInput, { target: { value: '5' } });
    expect(floorsInput.value).toBe('5');

    // Toggle basement checkbox
    const basementCheckbox = getByLabelText('Basement Floor') as HTMLInputElement;
    fireEvent.click(basementCheckbox);
    expect(basementCheckbox.checked).toBe(true);

    // Advance to step 6
    for (let i = 0; i < 4; i++) {
      fireEvent.click(getByText(/Continue/));
    }

    expect(getByText('Step 6 of 6: Review & Generate')).toBeDefined();
    expect(getByText(/Double height living room/)).toBeDefined();
    expect(getByText(/Ground \+ 4 \(5 Floors\) \+ Basement/)).toBeDefined();

    const generateBtn = getByText('Generate Complete House Plan Package');
    fireEvent.click(generateBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    const submittedData = handleSubmit.mock.calls[0][0];
    expect(submittedData.customWishlist).toBe('Double height living room facing North-East with rooftop pool and modern kitchen.');
    expect(submittedData.requirements.floors).toBe(5);
    expect(submittedData.requirements.hasBasement).toBe(true);
  });

  it('should allow 1-click instant generation directly from Step 1 when custom wishlist prompt is typed', () => {
    const handleSubmit = vi.fn();
    const { getByLabelText, getByText } = render(<IntakeWizard onSubmit={handleSubmit} />);

    const wishlistInput = getByLabelText(/Describe Your Dream House/i) as HTMLTextAreaElement;
    fireEvent.change(wishlistInput, {
      target: { value: 'I want to create a G+5 with stilt parking and duplex on 3rd floor' },
    });

    const instantBtn = getByText('⚡ Instant AI Generate from Vision');
    expect(instantBtn).toBeDefined();

    fireEvent.click(instantBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    const submittedData = handleSubmit.mock.calls[0][0];
    expect(submittedData.customWishlist).toContain('G+5');
    expect(submittedData.requirements.floors).toBe(6); // G+5 = 6 levels
  });
});

describe('StartPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should render the start page with header and IntakeWizard', () => {
    const { getByText } = render(<StartPage />);
    expect(getByText('Custom House Plan Generator')).toBeDefined();
    expect(getByText('Step 1 of 6: Plot Details')).toBeDefined();
  });

  it('should call /api/generate-plan and navigate to project page on successful submission', async () => {
    const mockPlan = { plot: { width: 30, length: 45 } };
    const globalFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        projectId: 'test-project-123',
        plan: mockPlan,
      }),
    });
    vi.stubGlobal('fetch', globalFetch);

    const { getByText } = render(<StartPage />);

    // Navigate to step 6
    for (let i = 0; i < 5; i++) {
      fireEvent.click(getByText(/Continue/));
    }

    const generateBtn = getByText('Generate Complete House Plan Package');
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(globalFetch).toHaveBeenCalledWith('/api/generate-plan', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));
    });

    await waitFor(() => {
      expect(sessionStorage.getItem('plan_test-project-123')).toBe(JSON.stringify(mockPlan));
      expect(mockPush).toHaveBeenCalledWith('/projects/test-project-123');
    });
  });

  it('should handle API HTTP error with error message from response', async () => {
    const alertMock = vi.fn();
    vi.stubGlobal('alert', alertMock);
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid plot dimensions provided' }),
    }));

    const { getByText } = render(<StartPage />);

    for (let i = 0; i < 5; i++) {
      fireEvent.click(getByText(/Continue/));
    }

    const generateBtn = getByText('Generate Complete House Plan Package');
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Invalid plot dimensions provided');
    });

    consoleErrorMock.mockRestore();
  });

  it('should handle API failure when projectId is missing with default fallback message', async () => {
    const alertMock = vi.fn();
    vi.stubGlobal('alert', alertMock);
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    }));

    const { getByText } = render(<StartPage />);

    for (let i = 0; i < 5; i++) {
      fireEvent.click(getByText(/Continue/));
    }

    const generateBtn = getByText('Generate Complete House Plan Package');
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Failed to generate plan. Please try again.');
    });

    consoleErrorMock.mockRestore();
  });

  it('should handle network failure gracefully', async () => {
    const alertMock = vi.fn();
    vi.stubGlobal('alert', alertMock);
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network disconnected')));

    const { getByText } = render(<StartPage />);

    for (let i = 0; i < 5; i++) {
      fireEvent.click(getByText(/Continue/));
    }

    const generateBtn = getByText('Generate Complete House Plan Package');
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Network disconnected');
    });

    consoleErrorMock.mockRestore();
  });
});
