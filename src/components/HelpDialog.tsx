import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  UploadSimple,
  Lightning,
  Cube,
  GitBranch,
  PencilSimple,
  Cpu,
  Eye,
  CheckCircle,
  Sparkle
} from '@phosphor-icons/react'

interface HelpDialogProps {
  open: boolean
  onClose: () => void
}

export function HelpDialog({ open, onClose }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Cpu size={28} weight="duotone" className="text-primary" />
            Comment utiliser l'analyseur de schémas électriques
          </DialogTitle>
          <DialogDescription>
            Guide complet pour analyser vos schémas électriques unifilaires avec l'IA
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-120px)] pr-4">
          <div className="space-y-6">
            <section className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/30 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Sparkle size={18} weight="fill" className="text-accent" />
                Essayez l'exemple
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Nouveau sur l'application ? Cliquez sur <Badge variant="outline" className="mx-1">Load Example</Badge> sur l'écran d'accueil
                pour charger un schéma industriel pré-analysé avec tous les composants et chemins électriques détectés.
              </p>
              <p className="text-xs text-accent-foreground">
                L'exemple montre un poste électrique avec transformateur, bus bars, disjoncteurs et moteurs.
              </p>
            </section>

            <Separator />

            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary font-mono">1</span>
                </div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <UploadSimple size={20} weight="duotone" className="text-accent" />
                  Télécharger un schéma
                </h3>
              </div>
              <div className="ml-10 space-y-2 text-sm text-muted-foreground">
                <p>
                  Cliquez sur le bouton <Badge variant="outline" className="mx-1">Upload</Badge> dans l'en-tête
                  pour télécharger votre schéma électrique unifilaire.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Formats acceptés : PNG, JPG, JPEG, SVG</li>
                  <li>Taille maximale recommandée : 10 MB</li>
                  <li>Résolution minimale : 1000px de largeur pour de meilleurs résultats</li>
                </ul>
                <div className="bg-accent/10 border border-accent/20 rounded-md p-3 mt-2">
                  <p className="text-accent-foreground text-xs">
                    <strong>Astuce :</strong> Assurez-vous que votre schéma est bien éclairé et net pour une meilleure reconnaissance des composants.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary font-mono">2</span>
                </div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Lightning size={20} weight="fill" className="text-accent" />
                  Analyser avec l'IA
                </h3>
              </div>
              <div className="ml-10 space-y-2 text-sm text-muted-foreground">
                <p>
                  Une fois votre schéma téléchargé, cliquez sur <Badge variant="default" className="mx-1">Analyze</Badge>
                  pour lancer l'analyse automatique par intelligence artificielle.
                </p>
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-md p-3 my-3">
                  <p className="font-medium text-foreground flex items-center gap-2 mb-2">
                    <Cpu size={16} weight="duotone" className="text-blue-500" />
                    Détection hybride avancée
                  </p>
                  <p className="text-xs text-blue-950/80 dark:text-blue-100/80">
                    L'application utilise une approche en deux étapes pour une précision maximale :
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2 mt-2 text-xs">
                    <li><strong>Vision par ordinateur :</strong> Détection de formes, couleurs et patterns géométriques (rectangles, cercles, lignes épaisses)</li>
                    <li><strong>Intelligence artificielle GPT-4o :</strong> Analyse contextuelle, lecture de texte et affinement des résultats</li>
                  </ul>
                </div>
                <p className="font-medium text-foreground mt-3 mb-2">Le système détecte automatiquement :</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Disjoncteurs (L1BT, CB) :</strong> Rectangles noirs avec intérieur blanc</li>
                  <li><strong>Bus bars :</strong> Lignes horizontales épaisses (souvent rouges)</li>
                  <li><strong>Transformateurs :</strong> Cercles concentriques avec symbole T</li>
                  <li><strong>Moteurs :</strong> Rectangles bleus avec symbole M circulaire</li>
                  <li><strong>Compteurs :</strong> Rectangles jaunes/dorés</li>
                  <li><strong>Disconnects :</strong> Petits rectangles en amont</li>
                </ul>
                <div className="bg-primary/5 border border-primary/20 rounded-md p-3 mt-2">
                  <p className="text-foreground text-xs">
                    <strong>Note :</strong> L'analyse peut prendre 10-20 secondes selon la complexité du schéma. Une barre de progression s'affiche pendant le traitement.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary font-mono">3</span>
                </div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Eye size={20} weight="duotone" className="text-accent" />
                  Consulter les résultats
                </h3>
              </div>
              <div className="ml-10 space-y-3 text-sm text-muted-foreground">
                <p>Après l'analyse, explorez les résultats via les trois onglets :</p>
                
                <div className="space-y-3 mt-3">
                  <div className="bg-card border border-border rounded-md p-3">
                    <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                      <Lightning size={16} className="text-primary" />
                      Onglet Analysis
                    </h4>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                      <li>Vue du schéma avec composants identifiés en surbrillance</li>
                      <li>Liste complète des composants détectés sur la droite</li>
                      <li>Cliquez sur un composant pour le sélectionner et voir ses détails</li>
                    </ul>
                  </div>

                  <div className="bg-card border border-border rounded-md p-3">
                    <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                      <Cube size={16} className="text-primary" />
                      Onglet Catalog
                    </h4>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                      <li>Catalogue de tous les types de composants trouvés</li>
                      <li>Nombre d'instances de chaque type</li>
                      <li>Base de connaissances évolutive qui s'améliore avec l'usage</li>
                    </ul>
                  </div>

                  <div className="bg-card border border-border rounded-md p-3">
                    <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                      <GitBranch size={16} className="text-primary" />
                      Onglet Paths
                    </h4>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                      <li>Chemins électriques identifiés dans le schéma</li>
                      <li>Niveaux de tension et composants connectés</li>
                      <li>Cliquez sur un chemin pour le visualiser sur le schéma</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary font-mono">4</span>
                </div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <PencilSimple size={20} weight="duotone" className="text-accent" />
                  Modifier et améliorer
                </h3>
              </div>
              <div className="ml-10 space-y-2 text-sm text-muted-foreground">
                <p>
                  Vous pouvez corriger et enrichir les données détectées par l'IA :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Sélectionnez un composant dans la liste</li>
                  <li>Cliquez sur le bouton <Badge variant="outline" className="mx-1 text-xs">Edit</Badge></li>
                  <li>Modifiez le type, les propriétés ou les spécifications techniques</li>
                  <li>Sauvegardez vos modifications</li>
                </ul>
                <div className="bg-accent/10 border border-accent/20 rounded-md p-3 mt-2">
                  <p className="text-accent-foreground text-xs">
                    <CheckCircle size={14} weight="fill" className="inline mr-1" />
                    <strong>Important :</strong> Vos corrections améliorent le catalogue et la précision future de l'IA. Le système apprend de vos modifications.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            <section className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Fonctionnalités avancées</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <div className="w-1 bg-primary rounded-full flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Catalogue évolutif</p>
                    <p className="text-xs">Le système utilise l'apprentissage profond pour améliorer continuellement la reconnaissance des composants basée sur des modèles pré-entraînés.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-1 bg-primary rounded-full flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Analyse des bus bars</p>
                    <p className="text-xs">Détection automatique des barres omnibus et des points de distribution électrique dans votre schéma.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-1 bg-primary rounded-full flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Traçage de chemins</p>
                    <p className="text-xs">Visualisation interactive des flux électriques et des connexions entre composants.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
