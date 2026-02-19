// REMPLACER TOUT LE CONTENU DE {step === 1 && ( ... )} PAR CE CODE :

{step === 1 && (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
        <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', marginBottom: '1rem', textAlign: 'center', fontWeight: 800 }}>
            Type de compte
        </h2>
        <p style={{ textAlign: 'center', color: c.textSecondary, marginBottom: '2rem', fontSize: '0.9rem' }}>
            Choisissez le type de compte qui vous correspond
        </p>

        {/* Choix Personnel / Entreprise */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div
                onClick={() => setFormData({ ...formData, accountCategory: 'personal', enterpriseType: '', companyName: '', numberOfEmployees: 1 })}
                style={{
                    padding: '2rem',
                    borderRadius: '1rem',
                    border: `2px solid ${formData.accountCategory === 'personal' ? c.accentPrimary : c.borderColor}`,
                    background: formData.accountCategory === 'personal' ? `${c.accentPrimary}15` : c.bgSecondary,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    textAlign: 'center',
                    boxShadow: formData.accountCategory === 'personal' ? `0 8px 16px ${c.accentPrimary}22` : 'none'
                }}
            >
                <User size={48} color={formData.accountCategory === 'personal' ? c.accentPrimary : c.textSecondary} style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Personnel</h3>
                <p style={{ fontSize: '0.85rem', color: c.textSecondary, margin: 0 }}>Compte individuel</p>
            </div>

            <div
                onClick={() => setFormData({ ...formData, accountCategory: 'enterprise', isStudent: false, studentCardImage: null, studentCardPreview: '' })}
                style={{
                    padding: '2rem',
                    borderRadius: '1rem',
                    border: `2px solid ${formData.accountCategory === 'enterprise' ? c.accentPrimary : c.borderColor}`,
                    background: formData.accountCategory === 'enterprise' ? `${c.accentPrimary}15` : c.bgSecondary,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    textAlign: 'center',
                    boxShadow: formData.accountCategory === 'enterprise' ? `0 8px 16px ${c.accentPrimary}22` : 'none'
                }}
            >
                <Building2 size={48} color={formData.accountCategory === 'enterprise' ? c.accentPrimary : c.textSecondary} style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Entreprise</h3>
                <p style={{ fontSize: '0.85rem', color: c.textSecondary, margin: 0 }}>Compte professionnel</p>
            </div>
        </div>

        {/* Si Personnel */}
        {formData.accountCategory === 'personal' && (
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: c.bgSecondary, borderRadius: '1rem', border: `1px solid ${c.borderColor}` }}>
                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: `1px solid ${formData.isStudent ? c.accentPrimary : c.borderColor}`,
                    background: formData.isStudent ? `${c.accentPrimary}10` : 'transparent',
                    transition: 'all 0.3s'
                }}>
                    <input
                        type="checkbox"
                        checked={formData.isStudent}
                        onChange={(e) => setFormData({ ...formData, isStudent: e.target.checked })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: c.accentPrimary }}
                    />
                    <GraduationCap size={28} color={formData.isStudent ? c.accentPrimary : c.textSecondary} />
                    <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '1.05rem' }}>Je suis étudiant</strong>
                        <p style={{ fontSize: '0.85rem', color: c.textSecondary, margin: 0, marginTop: '0.25rem' }}>
                            🎓 Bénéficiez de 50% de réduction sur tous les tarifs
                        </p>
                    </div>
                </label>

                {formData.isStudent && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: c.bgPrimary, borderRadius: '0.75rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                            📄 Carte étudiante (obligatoire)
                        </label>
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'student')}
                            style={{ display: 'none' }}
                            id="studentCard"
                        />
                        <label
                            htmlFor="studentCard"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                padding: '1.25rem',
                                border: `2px dashed ${formData.studentCardImage ? '#10b981' : c.borderColor}`,
                                borderRadius: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: formData.studentCardImage ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                            }}
                        >
                            {formData.studentCardImage ? <CheckCircle size={20} color="#10b981" /> : <Upload size={20} />}
                            <span style={{ fontWeight: 600 }}>
                                {formData.studentCardImage ? formData.studentCardImage.name : 'Télécharger la carte étudiante'}
                            </span>
                        </label>
                        {formData.studentCardPreview && (
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <img 
                                    src={formData.studentCardPreview} 
                                    alt="Aperçu carte étudiante" 
                                    style={{ 
                                        maxWidth: '100%', 
                                        maxHeight: '200px', 
                                        borderRadius: '0.5rem',
                                        border: `1px solid ${c.borderColor}`
                                    }} 
                                />
                            </div>
                        )}
                        <p style={{ fontSize: '0.75rem', color: c.textSecondary, marginTop: '0.75rem', textAlign: 'center' }}>
                            Formats acceptés : JPG, PNG, PDF (max 5 Mo)
                        </p>
                    </div>
                )}
            </div>
        )}

        {/* Si Entreprise */}
        {formData.accountCategory === 'enterprise' && (
            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 700, fontSize: '0.95rem' }}>
                    Type d'entreprise
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div
                        onClick={() => setFormData({ ...formData, enterpriseType: 'private', publicJustification: null, publicJustificationPreview: '' })}
                        style={{
                            padding: '1.5rem',
                            borderRadius: '1rem',
                            border: `2px solid ${formData.enterpriseType === 'private' ? c.accentPrimary : c.borderColor}`,
                            background: formData.enterpriseType === 'private' ? `${c.accentPrimary}15` : c.bgSecondary,
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.3s'
                        }}
                    >
                        <Building size={36} color={formData.enterpriseType === 'private' ? c.accentPrimary : c.textSecondary} style={{ marginBottom: '0.75rem' }} />
                        <strong style={{ display: 'block', fontSize: '1.05rem' }}>Privé</strong>
                        <p style={{ fontSize: '0.8rem', color: c.textSecondary, margin: 0, marginTop: '0.25rem' }}>Entreprise privée</p>
                    </div>

                    <div
                        onClick={() => setFormData({ ...formData, enterpriseType: 'public' })}
                        style={{
                            padding: '1.5rem',
                            borderRadius: '1rem',
                            border: `2px solid ${formData.enterpriseType === 'public' ? c.accentPrimary : c.borderColor}`,
                            background: formData.enterpriseType === 'public' ? `${c.accentPrimary}15` : c.bgSecondary,
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.3s'
                        }}
                    >
                        <Landmark size={36} color={formData.enterpriseType === 'public' ? c.accentPrimary : c.textSecondary} style={{ marginBottom: '0.75rem' }} />
                        <strong style={{ display: 'block', fontSize: '1.05rem' }}>Public</strong>
                        <p style={{ fontSize: '0.8rem', color: c.textSecondary, margin: 0, marginTop: '0.25rem' }}>Structure publique</p>
                    </div>
                </div>

                {formData.enterpriseType === 'public' && (
                    <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: c.bgSecondary, borderRadius: '1rem', border: `1px solid ${c.borderColor}` }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                            📋 Justificatif (obligatoire pour structure publique)
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'public')}
                            style={{ display: 'none' }}
                            id="publicJustif"
                        />
                        <label
                            htmlFor="publicJustif"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                padding: '1.25rem',
                                border: `2px dashed ${formData.publicJustification ? '#10b981' : c.borderColor}`,
                                borderRadius: '0.75rem',
                                cursor: 'pointer',
                                background: formData.publicJustification ? 'rgba(16, 185, 129, 0.1)' : c.bgPrimary
                            }}
                        >
                            {formData.publicJustification ? <CheckCircle size={20} color="#10b981" /> : <Upload size={20} />}
                            <span style={{ fontWeight: 600 }}>
                                {formData.publicJustification ? formData.publicJustification.name : 'Télécharger le justificatif'}
                            </span>
                        </label>
                        <p style={{ fontSize: '0.75rem', color: c.textSecondary, marginTop: '0.75rem', textAlign: 'center' }}>
                            SIRET, attestation, document officiel (PDF, JPG, PNG - max 5 Mo)
                        </p>
                    </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                        Nom de l'établissement
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="ex: Laboratoire BioTech Innovation"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            border: `1px solid ${c.borderColor}`,
                            background: c.bgSecondary,
                            color: c.textPrimary,
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                        Nombre d'employés / Comptes nécessaires
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="10000"
                        required
                        value={formData.numberOfEmployees}
                        onChange={(e) => setFormData({ ...formData, numberOfEmployees: parseInt(e.target.value) || 1 })}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            border: `1px solid ${c.borderColor}`,
                            background: c.bgSecondary,
                            color: c.textPrimary,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            textAlign: 'center'
                        }}
                    />
                    <p style={{ fontSize: '0.75rem', color: c.textSecondary, marginTop: '0.5rem', textAlign: 'center' }}>
                        💡 Le directeur peut créer et gérer les comptes des employés ou déléguer cette gestion aux chefs d'équipe
                    </p>
                </div>
            </div>
        )}
    </div>
)}
