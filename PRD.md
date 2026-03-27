# Electrical Schematic Analyzer

A web application for uploading single-line electrical diagrams, analyzing bus bars and electrical paths, recognizing components, and building an evolving component catalog using AI-powered analysis.

**Experience Qualities**:
1. **Technical** - Professional engineering interface that conveys precision and technical expertise
2. **Intelligent** - AI-powered component recognition feels smart and learns from user corrections
3. **Organized** - Clear visual hierarchy between diagram analysis, component catalog, and electrical paths

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This application requires multiple interconnected features: image upload and display, AI-powered component analysis, component catalog management with learning capabilities, electrical path tracing, and bus bar identification. The evolving catalog with pre-trained components represents a sophisticated data model.

## Essential Features

### Feature 1: Demo Example Loader
- **Functionality**: Load a pre-analyzed electrical schematic from the web with complete component recognition and path analysis
- **Purpose**: Allow users to immediately see the application's capabilities without uploading their own schematic
- **Trigger**: User clicks "Load Example" button on the welcome screen
- **Progression**: Click "Load Example" → Fetch diagram from web → Display pre-analyzed industrial substation schematic → Show 10 identified components → Display 4 electrical paths
- **Success Criteria**: Example loads quickly, demonstrates all key features (component list, catalog, paths), provides realistic industrial data

### Feature 2: Schematic Upload & Display
- **Functionality**: Upload and display single-line electrical diagrams (PNG, JPG, SVG)
- **Purpose**: Provides the foundation for all analysis operations
- **Trigger**: User clicks upload button or drags file to drop zone
- **Progression**: Click upload → Select file → Preview thumbnail → Confirm → Display full diagram with zoom/pan controls
- **Success Criteria**: Image displays clearly at various zoom levels, supports common electrical diagram formats

### Feature 3: Hybrid Component Detection System (OpenCV + AI)
- **Functionality**: Three-stage detection combining OpenCV.js template matching with rotation detection and GPT-4o AI analysis
- **Purpose**: Achieve maximum accuracy by leveraging computer vision (OpenCV), geometric pattern detection, and contextual AI understanding
- **Trigger**: User clicks "Analyze" button after upload
- **Progression**: Click analyze → Stage 1: User annotates sample components → Stage 2: OpenCV template matching with 4-angle rotation (0°, 90°, 180°, 270°) → Real-time component display as detected → Stage 3: AI refines results, extracts text labels, identifies ratings → Display components with confidence scores → Show detection statistics
- **Success Criteria**: Detects L1BT breakers, bus bars, transformers, motors, and other standard symbols with >85% confidence; handles rotated components automatically; provides detailed statistics on detection quality

**OpenCV Detection Pipeline**:
- **Template Extraction**: User-annotated regions extracted as templates
- **Multi-Angle Matching**: Templates rotated (0°, 90°, 180°, 270°) using OpenCV rotation matrices
- **TM_CCOEFF_NORMED**: Normalized cross-correlation template matching for robust detection
- **Non-Maximum Suppression**: Eliminates overlapping detections within radius
- **Confidence Filtering**: Only matches above threshold displayed
- **Fallback Mode**: If OpenCV.js unavailable, uses basic pixel-by-pixel comparison

**Detection Algorithms**:
- **Breakers (L1BT, CB)**: Dark rectangular regions with white interior rectangles
- **Bus Bars**: Thick horizontal lines (6+ pixels), often red/orange colored
- **Transformers**: Concentric circles with center text markers
- **Motors**: Blue rectangular regions with circular M symbol
- **Meters**: Yellow/gold rectangular regions
- **Disconnects**: Small rectangles in upstream positions (<30% diagram height)

**AI Refinement**:
- GPT-4o reviews computer vision results
- Extracts component labels (CB-1, T1, M2, etc.)
- Identifies voltage ratings and current ratings from text
- Verifies component types match electrical conventions
- Adds missing components that CV may have missed

### Feature 4: Bus Bar & Path Tracing
- **Functionality**: Trace electrical connections and identify bus bar networks
- **Purpose**: Understand electrical flow and power distribution paths
- **Trigger**: User clicks on a component or bus bar
- **Progression**: Click component → Highlight connected electrical path → Show voltage level → Display connected components in path view
- **Success Criteria**: Visual highlighting of connected elements, clear indication of electrical flow direction

### Feature 5: Evolving Component Catalog
- **Functionality**: Maintain a persistent catalog of recognized components that learns from user corrections
- **Purpose**: Build institutional knowledge and improve recognition accuracy over time
- **Trigger**: Automatic on component recognition, manual on user edits
- **Progression**: Component recognized → Stored in catalog with metadata → User corrects type → Catalog updates → Future recognition improved
- **Success Criteria**: Catalog grows with use, user can browse/edit catalog, improved accuracy on repeat component types

### Feature 6: Component Detail Editor
- **Functionality**: View and edit detailed properties of recognized components
- **Purpose**: Add technical specifications beyond visual recognition
- **Trigger**: Click on any recognized component
- **Progression**: Click component → Side panel opens → Display/edit properties (rating, voltage, manufacturer) → Save → Update catalog
- **Success Criteria**: All component metadata editable and persistent

## Edge Case Handling
- **Poor Quality Images**: Show warning if image resolution is too low, suggest minimum 1000px width
- **No Components Detected**: Provide manual component addition tools, guide user to improve image quality
- **Overlapping Components**: Allow user to manually separate/identify conflicting detections
- **Unsupported File Types**: Clear error message with supported format list
- **Large File Uploads**: Progress indicator, file size limit of 10MB with clear messaging

## Design Direction
The design should evoke precision engineering, technical competence, and intelligent automation. Think control room interfaces, CAD software aesthetics, and professional engineering tools - clean, structured, with purposeful use of technical accent colors to highlight electrical connections and component states.

## Color Selection

- **Primary Color**: Deep Electric Blue `oklch(0.45 0.15 250)` - Conveys electrical energy, technical precision, and trust
- **Secondary Colors**: 
  - Slate Gray `oklch(0.35 0.02 255)` - Professional background for technical content
  - Light Technical Gray `oklch(0.92 0.01 255)` - Clean surfaces for diagrams
- **Accent Color**: Voltage Orange `oklch(0.68 0.18 45)` - High-visibility for active components, warnings, and electrical paths
- **Foreground/Background Pairings**:
  - Primary Blue on White `oklch(0.45 0.15 250)` / `oklch(0.98 0 0)` - Ratio 7.2:1 ✓
  - White on Primary Blue `oklch(0.98 0 0)` / `oklch(0.45 0.15 250)` - Ratio 7.2:1 ✓
  - Slate on Light Gray `oklch(0.35 0.02 255)` / `oklch(0.92 0.01 255)` - Ratio 8.5:1 ✓
  - Voltage Orange on White `oklch(0.68 0.18 45)` / `oklch(0.98 0 0)` - Ratio 5.1:1 ✓

## Font Selection
Typography should convey technical precision with excellent readability for detailed specifications - use JetBrains Mono for technical data and Space Grotesk for UI elements to balance engineering aesthetics with modern usability.

- **Typographic Hierarchy**:
  - H1 (Page Title): Space Grotesk Bold / 32px / -0.02em letter spacing
  - H2 (Section Headers): Space Grotesk SemiBold / 24px / -0.01em letter spacing
  - H3 (Component Names): Space Grotesk Medium / 18px / normal letter spacing
  - Body Text: Space Grotesk Regular / 15px / normal letter spacing / 1.5 line height
  - Technical Data: JetBrains Mono Regular / 14px / normal letter spacing / monospace for alignment
  - Component Labels: JetBrains Mono Medium / 12px / for diagram overlays

## Animations
Animations should feel precise and purposeful, like CAD software interactions - instant feedback on component selection with subtle pulse highlighting, smooth pan/zoom with easing that feels like precision controls, component list items that slide in after analysis completes, and electrical path highlights that trace along connections with a subtle animated glow effect.

## Component Selection

- **Components**:
  - **Card**: Main container for diagram viewer, component catalog, and detail panels with subtle shadows
  - **Button**: Primary actions (Upload, Analyze) use filled primary style; secondary actions (Cancel, Reset) use outline variant
  - **Tabs**: Switch between Analysis View, Catalog View, and Paths View
  - **ScrollArea**: For component lists and catalog browsing with custom scrollbar styling
  - **Dialog**: Upload new schematic workflow, component detail editing
  - **Badge**: Component confidence scores, voltage level indicators with color coding
  - **Input / Label**: Component property editing in detail panel
  - **Separator**: Visual division between diagram viewer and component list
  - **Progress**: Analysis progress during AI processing
  - **Tooltip**: Quick component info on diagram hover

- **Customizations**:
  - Custom canvas component for diagram display with zoom/pan controls using mouse wheel and drag
  - Custom bounding box overlay system for highlighting recognized components
  - Custom electrical path highlighting with SVG line tracing
  - Color-coded badges for component types (red for breakers, blue for transformers, orange for bus bars)

- **States**:
  - Upload button: Default blue, hover with subtle scale, active with pressed effect, disabled gray while analyzing
  - Component cards: Default white, hover with border highlight, selected with primary blue border and shadow
  - Bounding boxes: Default blue outline, hover with thicker orange outline, selected with filled orange overlay at 20% opacity

- **Icon Selection**:
  - Upload: `UploadSimple` for file upload action
  - Analysis: `MagnifyingGlass` or `Lightning` for AI analysis trigger
  - Components: `Cube` for catalog, `CircuitBoard` for schematic
  - Paths: `GitBranch` or `Lightning` for electrical connections
  - Edit: `PencilSimple` for component editing
  - Zoom: `MagnifyingGlassMinus` / `MagnifyingGlassPlus` for diagram controls
  - Save: `FloppyDisk` for catalog updates

- **Spacing**:
  - Page padding: `p-6` on desktop, `p-4` on mobile
  - Card internal padding: `p-6` for content areas
  - Component list gap: `gap-3` between items
  - Form field spacing: `gap-4` for vertical stacking
  - Button padding: `px-6 py-2.5` for primary actions

- **Mobile**:
  - Stack diagram viewer above component list on mobile
  - Full-width tabs with horizontal scroll if needed
  - Upload button expands to full width
  - Component detail panel slides up from bottom as sheet instead of side panel
  - Touch-optimized zoom controls with pinch gesture support
  - Simplified diagram overlay with larger tap targets for component selection
