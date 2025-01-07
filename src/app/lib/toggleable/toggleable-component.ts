export interface ToggleableComponent {
  componentId: string;
  isOpen: boolean;
  open(): void;
  close(): void;
  toggle(): void;
}
  
  /*
  -----------------------
  > Implementation:
  -----------------------
  private toggleService: ToggleService = Inject(ToggleService);
  isOpen = false;

  ngOnInit(): void {
    this.toggleService.registerComponent(this);
  }

  ngOnDestroy(): void {
    this.toggleService.unregisterComponent(this.componentId);
  }

  open(): void {
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }
  */