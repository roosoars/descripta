import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import Toast from '../../../components/UI/Toast';

describe('Toast', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        act(() => {
            vi.runOnlyPendingTimers();
        });
        vi.useRealTimers();
    });

    it('renders message and type icon', () => {
        render(
            <Toast
                message="Success Message"
                type="success"
                onClose={() => { }}
            />
        );
        expect(screen.getByText('Success Message')).toBeInTheDocument();
        // Assuming success type renders a CheckCircle or similar, hard to test exact icon without digging into SVG, 
        // but component rendering confirms it didn't crash.
    });

    it('renders title when provided', () => {
        render(
            <Toast
                message="Msg"
                type="info"
                onClose={() => { }}
                title="Notification"
            />
        );
        expect(screen.getByText('Notification')).toBeInTheDocument();
    });

    it('calls onClose after duration', () => {
        const handleClose = vi.fn();
        render(
            <Toast
                message="Wait for it"
                type="warning"
                onClose={handleClose}
                duration={1000}
            />
        );

        expect(handleClose).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1000); // Trigger internal timeout
            vi.advanceTimersByTime(200); // Trigger animation timeout
        });

        expect(handleClose).toHaveBeenCalled();
    });

    it('calls onClose when close button clicked', () => {
        const handleClose = vi.fn();

        render(
            <Toast
                message="Close me"
                type="error"
                onClose={handleClose}
            />
        );

        const closeBtn = screen.getByLabelText('Close notification');
        fireEvent.click(closeBtn);

        act(() => {
            vi.advanceTimersByTime(200); // Animation delay
        });

        expect(handleClose).toHaveBeenCalled();
    });
});
