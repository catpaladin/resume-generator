interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
  "aria-label": string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, "aria-label": ariaLabel, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size="icon"
        className={cn("p-0", className)}
        aria-label={ariaLabel}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

export { Button, IconButton, buttonVariants };
